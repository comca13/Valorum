import zlib
import struct
import math
import os

def create_png(width, height, get_pixel_rgba):
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raw image data: filter byte 0 + RGBA per pixel per row
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # None filter
        for x in range(width):
            r, g, b, a = get_pixel_rgba(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])
            
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    return bytes(png)

def draw_valorum_icon(is_maskable=False):
    def get_pixel(x, y, w, h):
        nx = x / float(w)
        ny = y / float(h)
        
        # Base background: deep dark financial blue #090d16
        bg_r, bg_g, bg_b = 9, 13, 22
        
        if is_maskable:
            # Full bleed background for maskable
            safe_margin = 0.15
        else:
            # Rounded corner squircle
            rx = 0.22
            dx = max(0.0, abs(nx - 0.5) - (0.5 - rx))
            dy = max(0.0, abs(ny - 0.5) - (0.5 - rx))
            dist = math.sqrt(dx*dx + dy*dy)
            if dist > rx:
                # Outside squircle
                return 0, 0, 0, 0
            safe_margin = 0.12
            
        # Draw central rounded badge
        bx1, bx2 = safe_margin, 1.0 - safe_margin
        by1, by2 = safe_margin, 1.0 - safe_margin
        bw = bx2 - bx1
        bh = by2 - by1
        
        # Check inside badge
        if bx1 <= nx <= bx2 and by1 <= ny <= by2:
            # Subtle badge background gradient from #0c1527 to #0f1c33
            sub_ny = (ny - by1) / bh
            br = int(12 + (15 - 12) * sub_ny)
            bg_col = int(21 + (28 - 21) * sub_ny)
            bb = int(39 + (51 - 39) * sub_ny)
            
            # Coordinate inside badge: [0, 1]
            cx = (nx - bx1) / bw
            cy = (ny - by1) / bh
            
            # TrendingUp polyline points:
            # (0.20, 0.72) -> (0.42, 0.48) -> (0.60, 0.60) -> (0.82, 0.30)
            pts = [(0.20, 0.72), (0.42, 0.48), (0.60, 0.60), (0.82, 0.30)]
            
            # Check distance to segments
            def dist_to_segment(p1, p2, px, py):
                x1, y1 = p1
                x2, y2 = p2
                dx = x2 - x1
                dy = y2 - y1
                l2 = dx*dx + dy*dy
                if l2 == 0:
                    return math.hypot(px - x1, py - y1)
                t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / l2))
                proj_x = x1 + t * dx
                proj_y = y1 + t * dy
                return math.hypot(px - proj_x, py - proj_y)
                
            min_d = min(
                dist_to_segment(pts[0], pts[1], cx, cy),
                dist_to_segment(pts[1], pts[2], cx, cy),
                dist_to_segment(pts[2], pts[3], cx, cy)
            )
            
            # Arrow head: from (0.82, 0.30) to (0.64, 0.30) and to (0.82, 0.48)
            arrow_d1 = dist_to_segment((0.82, 0.30), (0.64, 0.30), cx, cy)
            arrow_d2 = dist_to_segment((0.82, 0.30), (0.82, 0.48), cx, cy)
            min_d = min(min_d, arrow_d1, arrow_d2)
            
            thickness = 0.045
            if min_d <= thickness:
                # Anti-aliasing blend
                factor = 1.0 - (min_d / thickness)
                # Brand gradient: cyan (#06b6d4) to emerald (#10b981)
                t_color = cx
                cr = int(6 * (1 - t_color) + 16 * t_color)
                cg = int(182 * (1 - t_color) + 185 * t_color)
                cb = int(212 * (1 - t_color) + 129 * t_color)
                return cr, cg, cb, 255
                
            # Node dots
            for px, py in pts:
                d_node = math.hypot(cx - px, cy - py)
                if d_node <= 0.042:
                    return 16, 185, 129, 255
                    
            return br, bg_col, bb, 255
            
        return bg_r, bg_g, bg_b, 255
        
    return get_pixel

os.makedirs('public', exist_ok=True)

# Generate standard 192x192
png_192 = create_png(192, 192, draw_valorum_icon(is_maskable=False))
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(png_192)

# Generate standard 512x512
png_512 = create_png(512, 512, draw_valorum_icon(is_maskable=False))
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(png_512)

# Generate maskable 512x512
png_maskable = create_png(512, 512, draw_valorum_icon(is_maskable=True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(png_maskable)

# Generate apple-touch-icon 180x180
png_apple = create_png(180, 180, draw_valorum_icon(is_maskable=False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)

print("Icons successfully created in public/")
