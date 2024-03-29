const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// 데이터베이스 정보 가져오기 (개발)
// const fs = require("fs");
// const databaseInfo = fs.readFileSync("./database.json");
// const parseData = JSON.parse(databaseInfo);

// mysql 연결
const mysql = require("mysql");
// 개발
// const connection = mysql.createConnection({
//     host: parseData.host,
//     user: parseData.user,
//     password: parseData.password,
//     port: parseData.port,
//     database: parseData.database,
//     charset : 'utf8mb4',
//     multipleStatements: true
// });

// 배포
const connection = mysql.createConnection({
    host: process.env.RDS_ENDPOINT,
    user: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB,
    charset : 'utf8mb4',
    multipleStatements: true
});


// aws-sdk 사용
const AWS = require("aws-sdk");

// s3 정보 가져오기 (개발)
// const s3Info = fs.readFileSync("./s3.json");
// const parseDataS3 = JSON.parse(s3Info);

// AWS.config.update({
//     accessKeyId: parseDataS3.ACCESS_KEY_ID,
//     secretAccessKey: parseDataS3.SECRET_ACCESS_KEY,
//     region: 'us-east-1',
// });

// s3 정보 가져오기 (배포)
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

// 업로드 이미지 관리
// app.use("/upload", express.static("upload"));
const multer = require('multer');
const multerS3 = require('multer-s3');

// 개발
// const upload = multer({
//     storage: multerS3({
//         s3: new AWS.S3(),
//         bucket: `${parseDataS3.BUCKET_NAME}`,
//         key: function (req, file, cb) {
//             cb(null, `upload/${file.originalname}`);
//         }
//     })
// });

// 배포
const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: `${process.env.S3_BUCKET_NAME}`,
        key: function (req, file, cb) {
            cb(null, `upload/${file.originalname}`);
        }
    })
});

app.use(express.json());
app.use(cors());

// 카테고리 가져오기
// c_group 데이터와 c_group + c_category 데이터 따로 가져오기
app.get('/categories', async (req, res) => {
    const query = "SELECT DISTINCT c_group FROM categories;" + 
    "SELECT c_group, GROUP_CONCAT(c_category SEPARATOR ',') as lists FROM categories GROUP BY c_group;";

    connection.query(query,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 모든 플레이리스트 가져오기
app.get('/playlists', async (req, res) => {
    const query = "SELECT * FROM playlists";
    connection.query(query,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 특정 플레이리스트 가져오기
app.get('/playlist/:id', async (req, res) => {
    const param = req.params;
    connection.query(
        `SELECT * FROM playlists WHERE p_id = ${param.id}`,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 모든 노래 가져오기
app.get('/songs', async (req, res) => {
    connection.query(
        'SELECT * FROM songs',
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 특정 카테고리의 노래만 가져오기
app.get('/songs/:category', async (req, res) => {
    const param = req.params;
    connection.query(
        `SELECT * FROM songs WHERE s_mood = '${param.category}' OR s_season = '${param.category}' OR s_situation='${param.category}'`,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 특정 노래 정보 가져오기
app.get('/song/:id', async (req, res) => {
    const param = req.params;
    connection.query(
        `SELECT * FROM songs WHERE s_id = ${param.id}`,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 검색 결과 가져오기
app.get('/search/:keyword', async (req, res) => {
    const param = req.params;
    connection.query(
        `SELECT * FROM songs WHERE s_name LIKE '%${param.keyword}%' OR s_artist LIKE '%${param.keyword}%' OR s_album LIKE '%${param.keyword}%'`,
        (error, result, fields) => {
            res.send(result);
        }
    )
})

// 랜덤 노래 가져오기
// app.get('/random/:num', async (req, res) => {
//     const param = req.params;
//     connection.query(
//         `SELECT * FROM songs ORDER BY RAND() LIMIT ${param.num}`,
//         (error, result, fields) => {
//             console.log(error);
//             console.log(result);
//             res.send(result);
//         }
//     )
// })

// 이미지 업로드
app.post('/image', upload.single('image'), (req, res) => {
    const file = req.file;
    res.send({
        imageUrl: file.location
    })
})

// playlists 테이블에 데이터 추가
app.post('/playlists', async (req, res) => {
    const { p_name, p_imgUrl, p_desc, p_group, p_category } = req.body; 

    connection.query("INSERT INTO playlists(p_name, p_imgUrl, p_desc, p_group, p_category) VALUES(?,?,?,?,?);", 
    [p_name, p_imgUrl, p_desc, p_group, p_category], 
    function(err, result, fields) {
        res.send(result);
    })
})

// songs 테이블에 데이터 추가
app.post('/songs', async (req, res) => {
    const { s_name, s_artist, s_album, s_year, s_time, s_imgUrl, s_season, s_mood, s_situation, s_youtubeUrl } = req.body;

    connection.query("INSERT INTO songs(s_name, s_artist, s_album, s_year, s_time, s_imgUrl, s_season, s_mood, s_situation, s_youtubeUrl) VALUES(?,?,?,?,?,?,?,?,?,?);",
    [s_name, s_artist, s_album, s_year, s_time, s_imgUrl, s_season, s_mood, s_situation, s_youtubeUrl],
    function(err, result, fields) {
        res.send(result);
    })
})

// 특정 플레이리스트 수정
app.put('/playlist/:id', async (req, res) => {
    const param = req.params;
    const { p_name, p_imgUrl, p_desc, p_group, p_category } = req.body;

    connection.query(`UPDATE playlists SET p_name='${p_name}', p_imgUrl='${p_imgUrl}', p_desc='${p_desc}', p_group='${p_group}', p_category='${p_category}' WHERE p_id=${param.id}`, 
    function(err, result, fields) {
        res.send(result);
    })
})

// 특정 노래 정보 수정
app.put('/song/:id', async (req, res) => {
    const param = req.params;
    const { s_name, s_artist, s_album, s_year, s_time, s_imgUrl, s_season, s_mood, s_situation, s_youtubeUrl } = req.body;

    connection.query(`UPDATE songs SET s_name='${s_name}', s_artist='${s_artist}', s_album='${s_album}', s_year='${s_year}', s_time='${s_time}', s_imgUrl='${s_imgUrl}', s_season='${s_season}', s_mood='${s_mood}', s_situation='${s_situation}', s_youtubeUrl='${s_youtubeUrl}' WHERE s_id=${param.id}`,
    function(err, result, fields) {
        res.send(result);
    })
})

// 특정 플레이리스트 삭제
app.delete('/playlist/:id', async (req, res) => {
    const param = req.params;
    connection.query(`DELETE FROM playlists WHERE p_id = ${param.id}`,
    function(err, result, fields) {
        res.send(result);
    })
})

// 특정 노래 삭제
app.delete('/song/:id', async (req, res) => {
    const param = req.params;
    connection.query(`DELETE FROM songs WHERE s_id = ${param.id}`,
    function(err, result, fields) {
        res.send(result);
    })
})

app.listen(port, hostname, () => {
    console.log("서버가 돌아가고 있습니다.");
})