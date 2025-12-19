import os
import pandas as pd

# Paths
dataset_dir = os.path.join("Dataset")
image_dir = os.path.join(dataset_dir, "Images")
splits = ["train", "val", "test"]
csv_files = [os.path.join(dataset_dir, f"semart_{split}.csv") for split in splits]

# Merge CSVs
dfs = [pd.read_csv(f, sep="\t", encoding="latin-1", on_bad_lines="skip") for f in csv_files]
df = pd.concat(dfs, ignore_index=True)

# Check if image exists, keep only valid rows
def image_exists(row):
    img_path = os.path.join(image_dir, row['IMAGE_FILE'])
    return os.path.isfile(img_path)

df = df[df.apply(image_exists, axis=1)].reset_index(drop=True)

# Re-index image ids from 0 to N-1
df['IMAGE_ID'] = range(len(df))

# Save merged and cleaned CSV
output_csv = os.path.join(dataset_dir, "semart_merged_cleaned.csv")
df.to_csv(output_csv, index=False)
print(f"Saved cleaned dataset to {output_csv}")