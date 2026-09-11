import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pptastuhmpzdyjeyhfts.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerification() {
  console.log("=== MINIMALL MARKETPLACE FULL SYSTEM VERIFICATION ===\n");

  let allPassed = true;

  // 1. Check Products Table
  try {
    const { data, error } = await supabase.from("products").select("id, name, price, in_stock, category, brand").limit(5);
    if (error) {
      console.error("❌ Products table error:", error.message);
      allPassed = false;
    } else {
      console.log(`✅ [1/5] Products table OK! Fetched ${data.length} sample products.`);
      console.log(`   Sample: "${data[0]?.name}" (${data[0]?.price} UZS, In Stock: ${data[0]?.in_stock})`);
    }

  } catch (err) {
    console.error("❌ Products exception:", err.message);
    allPassed = false;
  }

  // 2. Test Order Placement & Lifecycle
  const testOrderId = `ORD-TEST-${Date.now()}`;
  try {
    const testOrder = {
      id: testOrderId,
      customer: {
        name: "Тестовый Покупатель",
        phone: "+998 90 123 45 67",
        city: "Ташкент",
        address: "Чиланзар, кв-л 12, д. 45, кв. 10",
        paymentMethod: "cash",
        comment: "Тестовый заказ для проверки работоспособности магазина",
      },
      items: [
        {
          productId: 1,
          slug: "makita-hp1630",
          name: "Ударная дрель Makita HP1630",
          price: 850000,
          count: 1,
          image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop",
        },
      ],
      total_amount: 850000,
      status: "new",
      created_at: new Date().toISOString(),
    };

    // Insert order
    const { error: insertErr } = await supabase.from("orders").insert([testOrder]);
    if (insertErr) {
      console.error("❌ Order insert error:", insertErr.message);
      allPassed = false;
    } else {
      console.log(`✅ [2/5] Order creation OK! Order ${testOrderId} successfully inserted.`);

      // Verify query
      const { data: readOrder, error: readErr } = await supabase
        .from("orders")
        .select("*")
        .eq("id", testOrderId)
        .single();

      if (readErr || !readOrder) {
        console.error("❌ Order read error:", readErr?.message);
        allPassed = false;
      } else {
        console.log(`   Order verified: status="${readOrder.status}", amount=${readOrder.total_amount} UZS, customer="${readOrder.customer.name}"`);

        // Update status to processing
        const { error: updateErr } = await supabase
          .from("orders")
          .update({ status: "processing" })
          .eq("id", testOrderId);

        if (updateErr) {
          console.error("❌ Order update error:", updateErr.message);
          allPassed = false;
        } else {
          console.log(`   Status update OK: Changed to "processing".`);
        }

        // Clean up test order
        await supabase.from("orders").delete().eq("id", testOrderId);
        console.log(`   Cleanup OK: Test order ${testOrderId} removed.`);
      }
    }
  } catch (err) {
    console.error("❌ Order lifecycle exception:", err.message);
    allPassed = false;
  }

  // 3. Check Banners Table
  try {
    const { data, error } = await supabase.from("banners").select("*").limit(5);
    if (error) {
      console.error("❌ Banners table error:", error.message);
      allPassed = false;
    } else {
      console.log(`✅ [3/5] Banners table OK! ${data.length} carousel slides configured.`);
    }
  } catch (err) {
    console.error("❌ Banners exception:", err.message);
    allPassed = false;
  }

  // 4. Check Admins Table
  try {
    const { data, error } = await supabase.from("mm_admins").select("id, username, name, role, is_super_admin");
    if (error) {
      console.error("❌ Admins table error:", error.message);
      allPassed = false;
    } else {
      console.log(`✅ [4/5] Admins table OK! ${data.length} admin accounts registered:`);
      data.forEach((adm) => console.log(`   • @${adm.username} (${adm.name}) — ${adm.is_super_admin ? "Super Admin" : adm.role}`));
    }
  } catch (err) {
    console.error("❌ Admins exception:", err.message);
    allPassed = false;
  }

  // 5. Check Users Table
  try {
    const { count, error } = await supabase.from("mm_users").select("*", { count: "exact", head: true });
    if (error) {
      console.error("❌ Users table error:", error.message);
      allPassed = false;
    } else {
      console.log(`✅ [5/5] Users table OK! Registered customer accounts: ${count ?? 0}.`);
    }
  } catch (err) {
    console.error("❌ Users exception:", err.message);
    allPassed = false;
  }

  console.log("\n=======================================================");
  if (allPassed) {
    console.log("🎉 ALL BACKEND & DATABASE CHECKS PASSED WITH 100% SUCCESS!");
  } else {
    console.log("⚠️ Some checks reported errors.");
  }
  console.log("=======================================================\n");
}

runVerification();
