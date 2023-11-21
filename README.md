# survey_express_ver

## 사용스택

1. Express
2. Swagger
3. Winston
4. MYSQL
5. AWS RDS

## 서버 실행하는 법:

1. gitclone git@github.com:pgj0116/survey_express_ver.git
2. cd survey_exprress_ver
3. 이메일에 첨부된 .env 파일을 복사
4. npm i
5. npm start

## Swagger 사용법

1. 서버 실행 후 브라우저에서 http://localhost:4000/swagger 입력

## Log 보는 법

1. 프로젝트 루트 디렉토리에서 logs 폴더를 열어서 파일 검색. 단, 시스템상의 에러가 없는 이상 로그가 찍히지 않도록 개발함

## 기획 소개

### 개요

문제에는 명시되어 있지 않았지만 일반적인 다양한 설문을 주제별로 나눠서 생성하고
다양한 응답자가 설문에 임할 수 있도록 설계.

### 테이블

- 모든 테이블은 논리적인 Foreign Key를 사용하지만 어떠한 물리적 연결도 하지 않았음 => 데이터 관리에 용이함을 위해

#### Survey

- survey_id, survey_title, survey_detail로 구성.
- 다양한 종류의 설문을 생성할 수 있음

#### Question

    - survey_id, question_num, question_content, is_multiple로 구성.
    - 각각의 설문에 부속하는 각각의 질문을 생성할 수 있음. 선택형인지 주관식인지 구성할 수 있음.

#### Choice

     - survey_id, question_num, choice_num, choice_content, choice_point로 구성
     - 각 질문에 부속하는 선택문항을 생성할 수 있음. 각 선택문항별 점수를 부여할 수 있음(default=0)

#### Answer

     - survey_id, tester_id, question_num, sel_ans로 구성
     - 응답자별 설문의 문항별로 선택된 답을 기록함

#### Tester

     - tester_id, is_finished 로 구성
     - 익명의 설문이라는 전제로 응답자의 다른 정보는 입력하지 않음. 완료가 된 경우에는 수정 불가. 완료된 경우에만 점수 확인 가능

### 사용방법

#### 생성

1. POST survey/create 를 통해 설문 생성
2. POST question/create 를 통해 질문 생성(is_multiple:선택형인지 여부, ans_num_allowed:몇개의 중복 답 허용할지 여부) \*두 변수는 옵션이고 Default는 모두 1이다.
3. POST choice/create 를 통해 질문에 대한 선택항목을 만든다. (각 선택항목별로 점수를 부여할 수 있으며 옵션으로 Default는 1이다.)
4. POST tester/create 를 통해 응답자를 생성한다.
5. POST answer/create 를 통해 답안을 작성한다.
6. 답안을 모두 작성후 PATCH tester/update를 통해 작성 완료 여부를 변경한다. (완류 상태에서는 답안지를 추가 혹은 수정할 수 없다)

#### 조회

1. GET survey/all : 모든 설문 제목 및 설명 조회
2. GET survey/:survey_id: 특정 설문의 제목 및 설명 조회
3. GET question/all/:survey_id: 특정설문의 모든 질문 조회
4. GET question/one/:survey_id/:question_num: 특정설문 특정 질문 조회
5. GET choice/all/:survey_id/:question_num:특정질문의 모든 선택 조회
6. GET choice/one/:survey_id/:question_num/:choice_num: 특정질문 특정 선택 조회
7. GET tester/one/:survey_id/:tester_id: 특정 응답자 모든 응답 조회
8. GET tester/score/:survey_id/:tester_id:특정 응답자의 점수 조회(응답자의 상태가 완료여야지 점수 조회 가능)

#### 삭제 및 업데이트는 Swagger 참조
