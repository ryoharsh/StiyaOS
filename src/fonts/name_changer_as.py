import os
import re

folder = r"F:\Data\font\Elms_Sans\static"

def to_snake_case(name):
    # Replace hyphens with underscores
    name = name.replace("-", "_")

    # Insert underscores before capital letters
    name = re.sub(r'(?<!^)(?=[A-Z])', '_', name)

    # Convert to lowercase
    name = name.lower()

    # Remove duplicate underscores
    name = re.sub(r'_+', '_', name)

    return name

for filename in os.listdir(folder):
    old_path = os.path.join(folder, filename)

    if not os.path.isfile(old_path):
        continue

    base, ext = os.path.splitext(filename)

    new_name = to_snake_case(base) + ext.lower()

    new_path = os.path.join(folder, new_name)

    if old_path != new_path:
        os.rename(old_path, new_path)
        print(f"{filename} -> {new_name}")

print("Done!")