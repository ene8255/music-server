# Music-Server

![Badge](https://img.shields.io/badge/Node.js-339933.svg?&logo=Node.js&logoColor=fff)
![Badge](https://img.shields.io/badge/Express-000000.svg?&logo=Express&logoColor=fff)
![Badge](https://img.shields.io/badge/AmazonAWS-232F3E.svg?&logo=AmazonAWS&logoColor=fff)
![Badge](https://img.shields.io/badge/MySQL-4479A1.svg?&logo=MySQL&logoColor=fff)
![Badge](https://img.shields.io/badge/Heroku-430098.svg?&logo=Heroku&logoColor=fff)

### music-client 사이트 서버
---
- 서버 구축 기간: 9일
- 서버 주소: https://music-server-i.herokuapp.com/
---
- Amazon RDS를 이용하여 구축한 MySQL 데이터베이스와 Express를 사용하여 Node.js 서버를 생성하였습니다.
- 서버 배포는 Heroku를 이용하였습니다.
<br/>

- 기능:
  + 이미지 파일 미리보기, 업로드(POST) → multer 사용
  + categories 테이블에서 두가지 데이터 따로 가져오기(GET)
  + playlists 테이블에서 전체/특정 데이터 조회(GET), 등록(POST), 삭제(DELETE), 수정(UPDATE)
  + songs 테이블에서 전체/특정 데이터 조회(GET), 등록(POST), 삭제(DELETE), 수정(UPDATE)

