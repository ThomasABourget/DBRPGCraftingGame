import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    user: "postgres",
    port: 5432,
    password: "1022743",
    database: "ForgeDB"
});

(async () => {
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM playerInventory");
        console.log(res.rows);
    } catch (err) {
        console.error("Error executing query:", err); // Log the full error object
    } finally {
        await client.end();
    }
})();