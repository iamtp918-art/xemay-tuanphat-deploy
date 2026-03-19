
import * as db from "./db";
import { seedPolicies } from "./seed-policies";

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Seed Policies
    await seedPolicies();

    // 2. Seed Categories
    console.log("Inserting categories...");
    const defaultCategories = [
      { name: "Xe Tay Ga", slug: "xe-tay-ga", description: "Các dòng xe tay ga phổ biến", isActive: true, sortOrder: 1 },
      { name: "Xe Số", slug: "xe-so", description: "Các dòng xe số bền bỉ", isActive: true, sortOrder: 2 },
      { name: "Xe Côn Tay", slug: "xe-con-tay", description: "Các dòng xe côn tay thể thao", isActive: true, sortOrder: 3 },
    ];
    
    let catId = 1;
    for (const cat of defaultCategories) {
      try {
        const insertId = await db.createCategory(cat);
        if (cat.slug === "xe-tay-ga" && insertId) catId = insertId as number;
        console.log(`✅ Added category: ${cat.name}`);
      } catch (e) {
        console.log(`⚠️ Category already exists: ${cat.name}`);
      }
    }

    // 3. Seed a Motorcycle
    console.log("Inserting motorcycles...");
    try {
      await db.createMotorcycle({
        name: "Honda Vision 2023 Tiêu Chuẩn",
        slug: "honda-vision-2023-tieu-chuan",
        brand: "Honda",
        model: "Vision",
        year: 2023,
        price: 32500000,
        originalPrice: 35000000,
        condition: "like_new",
        mileage: 5000,
        engineSize: "110cc",
        color: "Trắng",
        description: "Xe đẹp như mới, chính chủ, đầy đủ giấy tờ. Bảo hành 12 tháng tại cửa hàng.",
        features: "Phanh CBS, Khóa Smartkey, Tiết kiệm xăng",
        images: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800",
        categoryId: catId,
        isAvailable: true,
        isFeatured: true
      });
      console.log("✅ Added motorcycle: Honda Vision");
    } catch (e) {
      console.log("⚠️ Motorcycle already exists");
    }

    console.log("✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
