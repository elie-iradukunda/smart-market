CREATE TABLE lead_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(12,2) DEFAULT 1,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);
