import os
from PIL import Image

# Directorios de entrada y salida
input_dir = 'public/ESCANER'
output_dir = 'public/Thumbnails'

# Crea el directorio de salida si no existe
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Recorre todos los archivos y subcarpetas en el directorio de entrada
for dirpath, dirnames, filenames in os.walk(input_dir):
    # Recorre todos los archivos en la carpeta actual
    for filename in filenames:
        # Solo procesa los archivos de imagen
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff')):

            # Crea la estructura de carpetas en el directorio de salida
            structure = os.path.join(output_dir, os.path.relpath(dirpath, input_dir))
            if not os.path.isdir(structure):
                os.makedirs(structure)

            # Abre la imagen original
            image = Image.open(os.path.join(dirpath, filename))
            # Cambia el tamaño de la imagen y la guarda en la carpeta de salida
            image.thumbnail((300, 300))  # puedes ajustar este valor
            image.save(os.path.join(output_dir, os.path.relpath(dirpath, input_dir), filename))

# Verificar y eliminar directorios y archivos que ya no existen en el directorio de entrada
for dirpath, dirnames, filenames in os.walk(output_dir):
    for filename in filenames:
        if not os.path.isfile(os.path.join(input_dir, os.path.relpath(dirpath, output_dir), filename)):
            os.remove(os.path.join(dirpath, filename))

    for dirname in dirnames:
        if not os.path.isdir(os.path.join(input_dir, os.path.relpath(dirpath, output_dir), dirname)):
            os.rmdir(os.path.join(dirpath, dirname))
