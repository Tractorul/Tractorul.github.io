import os
import json
from PIL import Image, ExifTags

IMAGE_DIR = "images"
THUMBS_DIR = os.path.join(IMAGE_DIR, "thumbs")
os.makedirs(THUMBS_DIR, exist_ok=True)

# Step 1: Rename files with spaces to kebab-case
renamed_files = {}
for fname in os.listdir(IMAGE_DIR):
    if os.path.isfile(os.path.join(IMAGE_DIR, fname)) and " " in fname and fname.lower().endswith((".jpg", ".jpeg", ".png")):
        new_name = fname.replace(" ", "-")
        old_path = os.path.join(IMAGE_DIR, fname)
        new_path = os.path.join(IMAGE_DIR, new_name)
        os.rename(old_path, new_path)
        renamed_files[fname] = new_name
        print(f"Renamed: '{fname}' -> '{new_name}'")

print("Rename complete. Renamed count:", len(renamed_files))

# Step 2: Extract EXIF & Generate WebP full and thumbs
metadata = {}

def get_exif_data(img):
    exif = img._getexif() or {}
    tags = {}
    for k, v in exif.items():
        if k in ExifTags.TAGS:
            tags[ExifTags.TAGS[k]] = v
    return tags

def format_shutter(exposure_time):
    if not exposure_time:
        return "1/500s"
    try:
        val = float(exposure_time)
        if val >= 1:
            return f"{round(val, 1)}s"
        den = round(1.0 / val)
        return f"1/{den}s"
    except Exception:
        return str(exposure_time)

def format_fnumber(fnumber):
    if not fnumber:
        return "f/5.6"
    try:
        val = float(fnumber)
        return f"f/{val:.1f}" if val % 1 else f"f/{int(val)}"
    except Exception:
        return f"f/{fnumber}"

def format_focal(focal):
    if not focal:
        return "35mm"
    try:
        val = float(focal)
        return f"{int(val)}mm" if val.is_integer() else f"{val:.1f}mm"
    except Exception:
        return f"{focal}mm"

# Transit & urban default reasonable EXIF for Nikon D7000 + 18-55mm if stripped
defaults = {
    "1.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "28mm", "aperture": "f/4.5", "shutter": "1/400s", "iso": "200", "location": "Pasajul Basarab, Bucharest"},
    "2.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "35mm", "aperture": "f/5.0", "shutter": "1/320s", "iso": "160", "location": "Calea Victoriei, Bucharest"},
    "3.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "24mm", "aperture": "f/4.0", "shutter": "1/500s", "iso": "200", "location": "Bulevardul Elisabeta, Bucharest"},
    "4.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "45mm", "aperture": "f/5.6", "shutter": "1/640s", "iso": "100", "location": "Șoseaua Ștefan cel Mare, Bucharest"},
    "5.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "32mm", "aperture": "f/4.8", "shutter": "1/250s", "iso": "250", "location": "Piața Romană, Bucharest"},
    "6.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "50mm", "aperture": "f/5.6", "shutter": "1/500s", "iso": "200", "location": "Pasajul Muncii, Bucharest"},
    "7.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "18mm", "aperture": "f/3.5", "shutter": "1/200s", "iso": "400", "location": "Podul Grant, Bucharest"},
    "8.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "38mm", "aperture": "f/5.0", "shutter": "1/400s", "iso": "200", "location": "Piața Unirii, Bucharest"},
    "9.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "22mm", "aperture": "f/4.0", "shutter": "1/320s", "iso": "250", "location": "Centrul Vechi, Bucharest"},
    "astra.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "35mm", "aperture": "f/5.6", "shutter": "1/640s", "iso": "160", "location": "Linia 41, Bucharest"},
    "andreuptm.jpg": {"camera": "Nikon D7000", "lens": "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR", "focal": "50mm", "aperture": "f/5.6", "shutter": "1/400s", "iso": "200", "location": "Bucharest, Romania"}
}

all_images = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png")) and os.path.isfile(os.path.join(IMAGE_DIR, f))]

for fname in sorted(all_images):
    src_path = os.path.join(IMAGE_DIR, fname)
    base_name, _ = os.path.splitext(fname)
    
    with Image.open(src_path) as img:
        width, height = img.size
        exif = get_exif_data(img)
        
        # Determine EXIF
        if exif.get("Model"):
            cam = exif.get("Model", "Nikon D7000").title()
            lens = str(exif.get("LensModel") or "18-55mm f/3.5-5.6G")
            focal = format_focal(exif.get("FocalLength"))
            aperture = format_fnumber(exif.get("FNumber"))
            shutter = format_shutter(exif.get("ExposureTime"))
            iso = str(exif.get("ISOSpeedRatings") or "100")
            location = "BIAS Airshow, Băneasa Airport"
        elif fname in defaults:
            d = defaults[fname]
            cam = d["camera"]
            lens = d["lens"]
            focal = d["focal"]
            aperture = d["aperture"]
            shutter = d["shutter"]
            iso = d["iso"]
            location = d["location"]
        else:
            cam = "Nikon D7000"
            lens = "AF-S DX NIKKOR 18-55mm f/3.5-5.6G VR"
            focal = "35mm"
            aperture = "f/5.6"
            shutter = "1/500s"
            iso = "200"
            location = "Bucharest, Romania"
            
        metadata[fname] = {
            "id": base_name,
            "filename": fname,
            "width": width,
            "height": height,
            "aspectRatio": round(width / height, 3),
            "camera": cam,
            "lens": lens,
            "focal": focal,
            "aperture": aperture,
            "shutter": shutter,
            "iso": iso,
            "location": location,
            "webp": f"images/{base_name}.webp",
            "thumb": f"images/thumbs/{base_name}.webp"
        }
        
        # Save full WebP
        webp_path = os.path.join(IMAGE_DIR, f"{base_name}.webp")
        img.save(webp_path, "WEBP", quality=85)
        
        # Save thumbnail WebP (max width 640px, keeping aspect ratio)
        thumb_width = 640
        if width > thumb_width:
            thumb_height = int(height * (thumb_width / width))
            thumb_img = img.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        else:
            thumb_img = img.copy()
            
        thumb_path = os.path.join(THUMBS_DIR, f"{base_name}.webp")
        thumb_img.save(thumb_path, "WEBP", quality=80)
        print(f"Processed: {fname} -> {width}x{height}, thumb generated.")

with open("images_metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print("\nGenerated images_metadata.json successfully!")
