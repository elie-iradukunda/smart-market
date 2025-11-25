ALTER TABLE quote_items
  ADD COLUMN material_id INT NULL AFTER quote_id,
  ADD CONSTRAINT fk_quote_items_material
    FOREIGN KEY (material_id) REFERENCES materials(id);
