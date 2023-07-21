import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
import os

# Configuración de las credenciales de la API de Google
scope = ['https://spreadsheets.google.com/feeds', 
         'https://www.googleapis.com/auth/drive']

# Aquí se necesita proporcionar tu propio archivo json de las credenciales
try:
    print('Cargando credenciales...')
    creds = Credentials.from_service_account_file('alaskacool-70aa4c0c518c.json', scopes=scope)
except Exception as e:
    print(f'Error al cargar las credenciales: {e}')
    raise

# Autenticación con Google
try:
    print('Autenticando con Google...')
    client = gspread.authorize(creds)
except Exception as e:
    print(f'Error al autenticar: {e}')
    raise

# Abre el documento de Google Sheets
try:
    print('Abriendo el documento...')
    sheet = client.open('Facturas2').sheet1
except Exception as e:
    print(f'Error al abrir el documento: {e}')
    raise

# Obtiene todos los valores de las celdas del documento
try:
    print('Obteniendo los valores de las celdas...')
    data = sheet.get_all_values()
except Exception as e:
    print(f'Error al obtener los valores de las celdas: {e}')
    raise

# Convierte los datos en un DataFrame de pandas
df = pd.DataFrame(data)

# Establece la ruta de la carpeta donde se guardará el archivo
output_dir = './public/'

# Comprueba si la carpeta existe, si no, la crea
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Nombre del archivo de salida
output_file = 'facturas.xlsx'

# Ruta completa del archivo de salida
output_path = os.path.join(output_dir, output_file)

# Guarda el DataFrame como un archivo Excel
try:
    print('Guardando el DataFrame...')
    df.to_excel(output_path, index=False, header=False)
except Exception as e:
    print(f'Error al guardar el DataFrame: {e}')
    raise

print('Script terminado con éxito')
