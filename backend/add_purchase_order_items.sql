CREATE TABLE purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT,
    material_id INT,
    quantity DECIMAL(12,2),
    unit_price DECIMAL(12,2),
    total DECIMAL(12,2),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (material_id) REFERENCES materials(id)
);