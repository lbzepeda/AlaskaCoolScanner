import logging
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from google.cloud import vision
from google.oauth2 import service_account
import pandas as pd
import time
import os

# Configuración de logging
logging.basicConfig(level=logging.DEBUG, handlers=[logging.FileHandler('script.log'), logging.StreamHandler()])

logging.info("Comenzando el script...")

# Cargar las credenciales del archivo json
gauth = GoogleAuth()
scope = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('alaskacool-70aa4c0c518c.json', scope)
gauth.credentials = creds
drive = GoogleDrive(gauth)
client = gspread.authorize(creds)

# Autenticación para el cliente de Vision
vision_creds = service_account.Credentials.from_service_account_file('reko-1680381422590-76be5b7a4546.json')
vision_client = vision.ImageAnnotatorClient(credentials=vision_creds)

def find_file_id_by_name(file_name):
    query = f"title='{file_name}' and trashed=false"
    file_list = drive.ListFile({'q': query}).GetList()
    return file_list[0]['id'] if file_list else None

def find_folder_id_by_name(folder_name):
    query = f"title='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    file_list = drive.ListFile({'q': query}).GetList()
    return file_list[0]['id'] if file_list else None

def list_files_in_folder(folder_id):
    query = f"'{folder_id}' in parents and trashed=false"
    return drive.ListFile({'q': query}).GetList()

def local_file_exists(file_path):
    return os.path.exists(file_path)

def process_files_in_folder(folder_id, folder_name):
    files_in_folder = list_files_in_folder(folder_id)
    for file in files_in_folder:
        # If the file is a folder, recurse into it
        if file['mimeType'] == 'application/vnd.google-apps.folder':
            process_files_in_folder(file['id'], f"{folder_name}/{file['title']}")
        else:
            # Only process files with the allowed extensions
            if file['title'].lower().endswith(allowed_extensions):
                local_folder_name = "public/" + folder_name  # prepend "public/" to the folder name for local directories
                local_file_path = f"{local_folder_name}/{file['title']}"
                # If the file does not exist in the local directory
                if not local_file_exists(local_file_path):
                    # Descarga la imagen
                    downloaded_file = drive.CreateFile({'id': file['id']})
                    os.makedirs(os.path.dirname(local_file_path), exist_ok=True)  # Create directory if it does not exist
                    downloaded_file.GetContentFile(local_file_path)

                    # Obtenemos la URL de la imagen
                    downloaded_file.FetchMetadata()
                    file_url = downloaded_file.metadata.get('webContentLink', '').replace('&export=download', '')

                    # Abre la imagen
                    with open(local_file_path, 'rb') as image_file:
                        # Crea una imagen de Vision a partir de la imagen descargada
                        image = vision.Image(content=image_file.read())

                    # Utiliza el cliente de Vision para extraer texto de la imagen
                    start_time = time.time()
                    response = vision_client.document_text_detection(image=image)
                    elapsed_time = time.time() - start_time

                    # Guarda la respuesta y el tiempo de respuesta
                    description = response.text_annotations[0].description if response.text_annotations else ''
                    analysis_time = round(elapsed_time, 2)

                    logging.info(f"Agregando el archivo {local_file_path} a Facturas2.")
                    new_row = {
                        'Consecutivo': dataframe['Consecutivo'].max() + 1 if not dataframe.empty else 1,
                        'Carpeta': folder_name,
                        'Imagen': file['title'],
                        'Descripción': description,
                        'TiempoAnálisis': analysis_time,
                        'ID Imagen': file['id'],
                        'URL': file_url
                    }
                    dataframe.loc[len(dataframe.index)] = new_row
                all_files.append(file['id'])

# Cargamos las facturas desde Google Drive
file_id = find_file_id_by_name('Facturas2')
spreadsheet = client.open_by_key(file_id)
sheet = spreadsheet.sheet1
dataframe = pd.DataFrame(sheet.get_all_records())

# Si el dataframe está vacío, añadimos las columnas necesarias
if dataframe.empty:
    dataframe = pd.DataFrame(columns=["Consecutivo", "Carpeta", "Imagen", "Descripción", "TiempoAnálisis", "ID Imagen", "URL"])

allowed_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff")

# Start processing in the 'ESCANER' folder
folder_id = find_folder_id_by_name('ESCANER')
all_files = []  # This will store all file IDs we encounter
process_files_in_folder(folder_id, 'ESCANER')

# Eliminar cualquier archivo en Facturas2 que ya no esté en Drive
for index, row in dataframe.iterrows():
    if row['ID Imagen'] not in all_files:
        print(f"Eliminando el archivo {row['Carpeta']}/{row['Imagen']} de Facturas2.")
        dataframe = dataframe.drop(index)
        # If the file exists in the local directory
        local_file_path = f"public/{row['Carpeta']}/{row['Imagen']}"
        if local_file_exists(local_file_path):
            # Remove the local file
            os.remove(local_file_path)
            print(f"Archivo {local_file_path} eliminado del directorio local.")

# Continuación del código anterior
updated_data = dataframe.values.tolist()
updated_data.insert(0, dataframe.columns.tolist())  # reinsert the headers at start
sheet.clear()
sheet.append_rows(updated_data)

logging.info("Facturas2 ha sido actualizado.")
