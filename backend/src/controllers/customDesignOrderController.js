import pool from '../config/database.js';
import emailService from '../services/emailService.js';
import config from '../config/settings.js';

export const createCustomDesignOrder = async (req, res) => {
    try {
        const {
            productType,
            width,
            height,
            bgColor,
            textColor,
            fontStyle,
            fontSize,
            textContent,
            designDescription,
            usageDescription,
            customerName,
            customerPhone,
            customerEmail,
            customerLocation,
            estimatedPrice,
            totalArea
        } = req.body;

        // Validation
        if (!productType || !width || !height || !customerName || !customerEmail || !customerPhone) {
            return res.status(400).json({ 
                error: 'Missing required fields: productType, dimensions, customer name, email, and phone are required' 
            });
        }

        // Insert order into database
        const [result] = await pool.execute(
            `INSERT INTO custom_design_orders (
                product_type, 
                width, 
                height, 
                total_area,
                bg_color, 
                text_color, 
                font_style, 
                font_size, 
                text_content, 
                design_description,
                usage_description,
                customer_name, 
                customer_phone, 
                customer_email, 
                customer_location,
                estimated_price,
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [
                productType,
                width,
                height,
                totalArea,
                bgColor,
                textColor,
                fontStyle,
                fontSize,
                textContent,
                designDescription || null,
                usageDescription || null,
                customerName,
                customerPhone,
                customerEmail,
                customerLocation || null,
                estimatedPrice
            ]
        );

        const orderId = result.insertId;

        // Send email to customer
        const customerSubject = '🎨 Custom Design Order Received - TOP Design';
        const customerContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">🎨 TOP Design</h1>
                        <p style="color: #6b7280; margin: 5px 0 0 0;">Creative Agency</p>
                    </div>
                    
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Order Confirmation</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Dear <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Thank you for your custom design order! We've received your request and our design team is reviewing it.
                    </p>
                    
                    <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">Order Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order ID:</td>
                                <td style="padding: 8px 0; color: #1f2937;">#${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Product Type:</td>
                                <td style="padding: 8px 0; color: #1f2937;">${productType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Dimensions:</td>
                                <td style="padding: 8px 0; color: #1f2937;">${width}m × ${height}m (${totalArea} m²)</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Estimated Price:</td>
                                <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">RWF ${Number(estimatedPrice).toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
                        <h4 style="color: #1e40af; margin: 0 0 10px 0;">Next Steps:</h4>
                        <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Our design team will review your specifications</li>
                            <li style="margin-bottom: 8px;">We'll contact you at <strong>${customerPhone}</strong> to confirm details</li>
                            <li style="margin-bottom: 8px;">Once approved, you'll receive a payment link</li>
                            <li>After payment, production will begin immediately</li>
                        </ol>
                    </div>
                    
                    <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-top: 25px;">
                        If you have any questions, please don't hesitate to contact us.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            TOP Design Creative Agency<br>
                            Email: info@topdesign.rw | Phone: +250 788 123 456
                        </p>
                    </div>
                </div>
            </div>
        `;

        try {
            await emailService.sendEmail(customerEmail, customerSubject, customerContent);
        } catch (emailError) {
            console.error('Failed to send customer email:', emailError);
        }

        // Send notification email to admin/staff
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@topdesign.rw';
        const adminSubject = `🔔 New Custom Design Order #${orderId}`;
        const adminContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1f2937;">New Custom Design Order</h2>
                
                <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">Order #${orderId}</h3>
                    
                    <h4 style="color: #4b5563; margin-bottom: 10px;">Customer Information:</h4>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
                    ${customerLocation ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${customerLocation}</p>` : ''}
                    
                    <h4 style="color: #4b5563; margin: 20px 0 10px 0;">Design Specifications:</h4>
                    <p style="margin: 5px 0;"><strong>Product Type:</strong> ${productType}</p>
                    <p style="margin: 5px 0;"><strong>Dimensions:</strong> ${width}m × ${height}m (${totalArea} m²)</p>
                    <p style="margin: 5px 0;"><strong>Background Color:</strong> ${bgColor}</p>
                    <p style="margin: 5px 0;"><strong>Text Color:</strong> ${textColor}</p>
                    <p style="margin: 5px 0;"><strong>Font Style:</strong> ${fontStyle}</p>
                    <p style="margin: 5px 0;"><strong>Font Size:</strong> ${fontSize}px</p>
                    <p style="margin: 5px 0;"><strong>Text Content:</strong> ${textContent}</p>
                    
                    ${designDescription ? `
                        <h4 style="color: #4b5563; margin: 20px 0 10px 0;">Design Description:</h4>
                        <p style="background: white; padding: 15px; border-radius: 6px; margin: 5px 0;">${designDescription}</p>
                    ` : ''}
                    
                    ${usageDescription ? `
                        <h4 style="color: #4b5563; margin: 20px 0 10px 0;">Usage Description:</h4>
                        <p style="background: white; padding: 15px; border-radius: 6px; margin: 5px 0;">${usageDescription}</p>
                    ` : ''}
                    
                    <h4 style="color: #4b5563; margin: 20px 0 10px 0;">Pricing:</h4>
                    <p style="margin: 5px 0; font-size: 18px; color: #059669; font-weight: bold;">
                        RWF ${Number(estimatedPrice).toLocaleString()}
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    Please review this order and contact the customer to confirm details.
                </p>
            </div>
        `;

        try {
            await emailService.sendEmail(adminEmail, adminSubject, adminContent);
        } catch (emailError) {
            console.error('Failed to send admin email:', emailError);
        }

        res.status(201).json({
            message: 'Custom design order created successfully',
            orderId: orderId,
            estimatedPrice: estimatedPrice
        });

    } catch (error) {
        console.error('Create custom design order error:', error);
        res.status(500).json({ error: 'Failed to create custom design order' });
    }
};

export const getCustomDesignOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await pool.execute(
            'SELECT * FROM custom_design_orders WHERE id = ?',
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(orders[0]);
    } catch (error) {
        console.error('Get custom design order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

export const getUserCustomDesignOrders = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email parameter is required' });
        }

        const [orders] = await pool.execute(
            'SELECT * FROM custom_design_orders WHERE customer_email = ? ORDER BY created_at DESC',
            [email]
        );

        res.json(orders);
    } catch (error) {
        console.error('Get user custom design orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getAllCustomDesignOrders = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT o.*, u.name as assigned_staff_name 
            FROM custom_design_orders o
            LEFT JOIN users u ON o.assigned_to = u.id
        `;
        let params = [];

        if (status) {
            query += ' WHERE o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC';

        const [orders] = await pool.execute(query, params);

        res.json(orders);
    } catch (error) {
        console.error('Get all custom design orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const updateCustomDesignOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentLink, assignedTo, productionStage } = req.body;

        const validStatuses = ['pending', 'approved', 'payment_pending', 'paid', 'in_production', 'completed', 'cancelled'];
        
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const [orders] = await pool.execute(
            'SELECT * FROM custom_design_orders WHERE id = ?',
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        const fields = ['updated_at = NOW()'];
        const params = [];

        if (status) {
            fields.push('status = ?');
            params.push(status);
        }
        
        if (paymentLink !== undefined) {
            fields.push('payment_link = ?');
            params.push(paymentLink);
        }

        if (assignedTo !== undefined) {
            fields.push('assigned_to = ?');
            params.push(assignedTo || null);
        }

        if (productionStage !== undefined) {
            fields.push('production_stage = ?');
            params.push(productionStage);
        }

        params.push(id);

        await pool.execute(
            `UPDATE custom_design_orders SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        // SYNC with work_orders table for unified tracking
        if (assignedTo || productionStage || status === 'in_production') {
            // Check if a work order already exists for this custom design
            const [existingWorkOrders] = await pool.execute(
                'SELECT id FROM work_orders WHERE custom_design_order_id = ?',
                [id]
            );

            if (existingWorkOrders.length > 0) {
                // Update existing work order
                const woFields = [];
                const woParams = [];
                
                if (assignedTo !== undefined) {
                    woFields.push('assigned_to = ?');
                    woParams.push(assignedTo || null);
                }
                
                if (productionStage) {
                    woFields.push('stage = ?');
                    // Align with frontend timeline: design, print, finish, ready, delivered
                    const validStages = ['design', 'prepress', 'print', 'finish', 'finishing', 'qa', 'ready', 'delivered'];
                    let normalizedStage = productionStage.toLowerCase();
                    if (normalizedStage === 'finishing') normalizedStage = 'finish';
                    
                    woParams.push(validStages.includes(normalizedStage) ? normalizedStage : normalizedStage);
                }

                if (woFields.length > 0) {
                    woParams.push(existingWorkOrders[0].id);
                    await pool.execute(
                        `UPDATE work_orders SET ${woFields.join(', ')} WHERE id = ?`,
                        woParams
                    );
                }
            } else {
                // Create new work order
                const stage = productionStage || 'design';
                const validStages = ['design', 'prepress', 'print', 'finish', 'finishing', 'qa', 'ready', 'delivered'];
                let normalizedStage = stage.toLowerCase();
                if (normalizedStage === 'finishing') normalizedStage = 'finish';
                
                const finalStage = normalizedStage;
                
                await pool.execute(
                    'INSERT INTO work_orders (custom_design_order_id, assigned_to, stage, started_at) VALUES (?, ?, ?, NOW())',
                    [id, assignedTo || null, finalStage]
                );
            }
        }

        let subject = '';
        let content = '';
        let shouldSendEmail = !!status && status !== order.status;

        if (shouldSendEmail) {
            switch (status) {
                case 'approved':
                    subject = '✅ Design Approved - TOP Design';
                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #1f2937;">Your Design Request is Approved!</h2>
                            <p>Dear ${order.customer_name},</p>
                            <p>Great news! Our team has reviewed and approved your custom design request for a <strong>${order.product_type}</strong> (#${id}).</p>
                            <p>We are now preparing the final production files. You will receive a payment link shortly to proceed with the order.</p>
                            <p>Thank you for choosing TOP Design!</p>
                        </div>
                    `;
                    break;
                case 'payment_pending':
                    subject = '💳 Payment Required - Custom Design Order';
                    const paymentInfo = paymentLink || order.payment_link || '';
                    const optionsMatch = paymentInfo.match(/OPTIONS:\n([\s\S]*?)\n\nSTEPS:/);
                    const stepsMatch = paymentInfo.match(/STEPS:\n([\s\S]*?)(\n\nLINK:|$)/);
                    const linkMatch = paymentInfo.match(/LINK: (.*)/);

                    const displayOptions = optionsMatch ? optionsMatch[1] : paymentInfo;
                    const displaySteps = stepsMatch ? stepsMatch[1] : '';
                    const directLink = linkMatch ? linkMatch[1] : '';

                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <div style="background: #7c3aed; padding: 30px; text-align: center; color: white;">
                                <h2 style="margin: 0; font-size: 24px; font-weight: 800;">Action Required: Payment</h2>
                                <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${id} is ready for production</p>
                            </div>
                            <div style="padding: 30px;">
                                <p style="color: #374151; font-size: 16px;">Dear <strong>${order.customer_name}</strong>,</p>
                                <p style="color: #4b5563; line-height: 1.6;">Your design request for a <strong>${order.product_type}</strong> has been approved. Please follow the instructions below to complete your payment.</p>
                                <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                    <div style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Total Amount Due</div>
                                    <div style="color: #111827; font-size: 28px; font-weight: 800;">RWF ${Number(order.estimated_price).toLocaleString()}</div>
                                </div>
                                <div style="margin-bottom: 25px;">
                                    <h3 style="color: #111827; font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">Payment Options</h3>
                                    <div style="background: #ffffff; border-left: 4px solid #7c3aed; padding: 15px; color: #374151; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${displayOptions}</div>
                                </div>
                                ${displaySteps ? `
                                <div style="margin-bottom: 25px;">
                                    <h3 style="color: #111827; font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">Steps to Pay</h3>
                                    <div style="color: #4b5563; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${displaySteps}</div>
                                </div>
                                ` : ''}
                                ${directLink ? `
                                <div style="text-align: center; margin-top: 30px;">
                                    <p style="color: #6b7280; font-size: 13px; margin-bottom: 15px;">Or use the direct payment link below:</p>
                                    <a href="${directLink}" style="background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 700; font-size: 16px;">Pay Online Now</a>
                                </div>
                                ` : ''}
                            </div>
                            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you have any questions, please contact our support team at info@topdesign.rw</p>
                            </div>
                        </div>
                    `;
                    break;
                case 'paid':
                    subject = '💰 Payment Confirmed - TOP Design';
                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #059669;">Payment Received!</h2>
                            <p>Dear ${order.customer_name},</p>
                            <p>Thank you! We have received your payment for order #${id}.</p>
                            <p>Your order for a <strong>${order.product_type}</strong> has been moved to our production queue.</p>
                        </div>
                    `;
                    break;
                case 'in_production':
                    subject = '🏗️ Production Started - TOP Design';
                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #4f46e5;">Your Order is being Crafted</h2>
                            <p>Dear ${order.customer_name},</p>
                            <p>We've started production on your custom <strong>${order.product_type}</strong> (#${id})!</p>
                            <p>Our craftsmen are working to ensure everything meets our quality standards. We will notify you as soon as it's ready.</p>
                        </div>
                    `;
                    break;
                case 'completed':
                    subject = '✨ Order Completed - TOP Design';
                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #059669;">Your Order is Ready!</h2>
                            <p>Dear ${order.customer_name},</p>
                            <p>Exciting news! Your custom design order #${id} is complete and ready.</p>
                            <p>Our team will contact you shortly regarding delivery or pickup instructions.</p>
                            <p>We hope you love your new <strong>${order.product_type}</strong>!</p>
                        </div>
                    `;
                    break;
                case 'cancelled':
                    subject = '⚠️ Order Update - Custom Design';
                    content = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #dc2626;">Order Cancelled</h2>
                            <p>Dear ${order.customer_name},</p>
                            <p>We're writing to inform you that your custom design order #${id} has been cancelled.</p>
                            <p>If you have any questions or would like to discuss a new design, please reply to this email.</p>
                        </div>
                    `;
                    break;
                default:
                    shouldSendEmail = false;
            }
        }

        if (shouldSendEmail && subject && content) {
            try {
                await emailService.sendEmail(order.customer_email, subject, content);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update custom design order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
