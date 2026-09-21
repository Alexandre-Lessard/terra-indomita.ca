-- Invented development data. Never load real registrations here.
-- Dates are relative to today so the calendar always has something to show.

DELETE FROM registrations;
DELETE FROM events;

INSERT INTO events (id, title, start_at, end_at, location, description) VALUES
  ('seed-past', 'Initiation à l''orientation (exemple passé)',
   strftime('%Y-%m-%dT09:00:00', 'now', '-20 days'), strftime('%Y-%m-%dT16:00:00', 'now', '-20 days'),
   'Franklin, QC', 'Lire une carte topographique et se servir d''une boussole.'),
  ('seed-soon', 'Stage d''autonomie en plein air — débutant (exemple)',
   strftime('%Y-%m-%dT09:00:00', 'now', '+10 days'), strftime('%Y-%m-%dT17:00:00', 'now', '+10 days'),
   'Franklin, QC', 'Abri, feu, eau potable : les bases pour être bien dehors.
Apportez des vêtements adaptés à la météo.'),
  ('seed-weekend', 'Camp immersif de fin de semaine (exemple)',
   strftime('%Y-%m-%dT10:00:00', 'now', '+30 days'), strftime('%Y-%m-%dT15:00:00', 'now', '+32 days'),
   'Franklin, QC', 'Deux nuits en forêt pour mettre les acquis en pratique.'),
  ('seed-no-end', 'Sortie d''observation des oiseaux (exemple)',
   strftime('%Y-%m-%dT07:30:00', 'now', '+45 days'), NULL,
   '', 'Heure de départ seulement : durée d''environ trois heures.');

UPDATE settings SET show_current_events = 1 WHERE id = 1;
