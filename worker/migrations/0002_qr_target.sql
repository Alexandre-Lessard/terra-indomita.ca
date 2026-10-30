-- Where the printed QR code (/qr) sends visitors; editable in the admin.
ALTER TABLE settings ADD COLUMN qr_target TEXT NOT NULL DEFAULT '/decouvrir/';
