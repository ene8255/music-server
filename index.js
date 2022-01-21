const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

const fs = require("fs");
const databaseInfo = fs.readFileSync("./database.json");
const parseData = JSON.parse(databaseInfo);

const mysql = require("mysql");
const connection = mysql.createConnection({
    host: parseData.host,
    user: parseData.user,
    password: parseData.password,
    port: parseData.port,
    database: parseData.database,
    charset : 'utf8mb4',
    multipleStatements: true
})

app.use(express.json());
app.use(cors());

// 카테고리 가져오기
app.get('/categories', async (req, res) => {
    const query = "SELECT DISTINCT c_group FROM categories;" + 
    "SELECT c_group, GROUP_CONCAT(c_category SEPARATOR ',') as lists FROM categories GROUP BY c_group;";

    connection.query(query,
        (error, result, fields) => {
            console.log(result);
            res.send(result);
        }
    )
})

app.listen(port, () => {
    console.log("서버가 돌아가고 있습니다.");
})