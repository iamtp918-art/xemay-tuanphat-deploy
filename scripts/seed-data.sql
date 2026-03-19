-- Seed initial data for Xe Máy Tuấn Phát
-- Run this AFTER create-tables.sql

-- Seed Categories
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`, `isActive`, `sortOrder`) VALUES
('Xe Tay Ga', 'xe-tay-ga', 'Các dòng xe tay ga phổ biến', TRUE, 1),
('Xe Số', 'xe-so', 'Các dòng xe số bền bỉ', TRUE, 2),
('Xe Côn Tay', 'xe-con-tay', 'Các dòng xe côn tay thể thao', TRUE, 3);

-- Seed a sample motorcycle
INSERT IGNORE INTO `motorcycles` (`name`, `slug`, `brand`, `model`, `year`, `price`, `originalPrice`, `condition`, `mileage`, `engineSize`, `color`, `description`, `features`, `images`, `categoryId`, `isAvailable`, `isFeatured`) VALUES
('Honda Vision 2023 Tiêu Chuẩn', 'honda-vision-2023-tieu-chuan', 'Honda', 'Vision', 2023, 32500000, 35000000, 'like_new', 5000, '110cc', 'Trắng', 'Xe đẹp như mới, chính chủ, đầy đủ giấy tờ. Bảo hành 12 tháng tại cửa hàng.', 'Phanh CBS, Khóa Smartkey, Tiết kiệm xăng', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800', 1, TRUE, TRUE);

-- Note: Policies will be auto-seeded by the application on first startup
