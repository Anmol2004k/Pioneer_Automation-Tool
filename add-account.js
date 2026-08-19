const db = require("./database");
const { encrypt } = require("./crypto");

async function addAccounts() {
    try {
        // Yahan jitne chahe accounts add kar sakte ho
        const accounts = [
           
        
            {
                customerName: "GOLDEN SUN AGRO FOODS",
                username: "goldensunagrofoods@gmail.com",
                password: "@Golden25"
            },
            {
                customerName: "RUBY INDUSTRIES",
                username: "ahuja0210@gmail.com",
                password: "@Rub2025"
            },
            {
                customerName: "COLOR ZONE",
                username: "arunsharma@gmail.com",
                password: "Arun@1234"
            },
            {
                customerName: "BUDH SINGH & BROTHER",
                username: "aman67387@gmail.com",
                password: "@Budh2025"
            },
            {
                customerName: "TAJ AGRO INDUSTRIES",
                username: "tajagro687@gmail.com",
                password: "@Taj2026"
            },
            {
                customerName: "GRANDLEY ELECTRONICS",
                username: "sales@grandlaycable.com",
                password: "@Gra2026"
            },
            {
                customerName: "PAPCOAT INDIA PVT LTD",
                username: "nmpapcoat@gmail.com",
                password: "@Pap2026"
            },
            {
                customerName: "PARUTHI ENGG PVT LTD",
                username: "skaushik@paruthigroup.com",
                password: "@Paruthi26"
            },
            {
                customerName: "KEDAR ALLOYS",
                username: "ashish.saxena45@yahoo.in",
                password: "@Ked2026"
            },
            {
                customerName: "K M POLY-YARN PVT LTD",
                username: "manish@kmpolyyarn.com",
                password: "@Kmp2026"
            },
            {
                customerName: "SHREE HARI INDUSTRIES",
                username: "Anuj_milex@hotmail.com",
                password: "Shr@2026"
            },
            {
                customerName: "SANTOSH PARGAL AND COMPANY",
                username: "santoshpargal@yahoo.com",
                password: "Sanjay@22"
            },
            {
                customerName: "CHANDNI INDUSTRIES PVT LTD",
                username: "chandniindustries001@gmail.com",
                password: "Cipl@503"
            }

        ];

        const sql = `
      INSERT INTO accounts
      (
        customer_name,
        username,
        password_encrypted
      )
      VALUES (?, ?, ?)
    `;

        // Ek-ek account database mein insert hoga
        for (const account of accounts) {

            // Password encrypt karo
            const encryptedPassword = encrypt(account.password);

            const [result] = await db.execute(sql, [
                account.customerName,
                account.username,
                encryptedPassword
            ]);

            console.log(
                `✅ ${account.customerName} added successfully! ID: ${result.insertId}`
            );
        }

        console.log("\n=================================");
        console.log("🎉 ALL ACCOUNTS ADDED SUCCESSFULLY");
        console.log("=================================");

    } catch (error) {

        console.error("❌ Error adding accounts:");
        console.error(error.message);

    } finally {

        process.exit();

    }
}

addAccounts();