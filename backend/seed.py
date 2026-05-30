import sys
import os

# Adjust path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models.post import Post

SEED_POSTS = [
    # 민원 (complaint) — 4건
    {
        "category": "complaint", 
        "title": "도로 포트홀 발견",
        "content": "역삼역 2번 출구 앞 도로에 큰 포트홀이 있습니다. 차량 통행에 매우 위험합니다.",
        "author": "시민A", 
        "latitude": 37.4979, 
        "longitude": 127.0276
    },
    {
        "category": "complaint", 
        "title": "가로등 고장 신고",
        "content": "종로구 인사동길 가로등 3개가 일주일째 꺼져 있어 밤에 어둡고 위험합니다.",
        "author": "야간보행자", 
        "latitude": 37.5735, 
        "longitude": 126.9856
    },
    {
        "category": "complaint", 
        "title": "불법 주정차 심각",
        "content": "영등포구 여의도동 63빌딩 뒤편 골목에 불법 주정차가 만연합니다.",
        "author": "익명", 
        "latitude": 37.5194, 
        "longitude": 126.9404
    },
    {
        "category": "complaint", 
        "title": "보도블록 파손 위험",
        "content": "마포구 홍대입구역 인근 보도블록이 심하게 파손되어 보행 중 넘어질 위험이 있습니다.",
        "author": "동네주민", 
        "latitude": 37.5571, 
        "longitude": 126.9246
    },

    # 건의 (suggestion) — 3건
    {
        "category": "suggestion", 
        "title": "공원 벤치 추가 설치 요청",
        "content": "남산 둘레길 중간 구간에 쉴 수 있는 벤치가 부족합니다. 어르신들을 위해 추가 설치를 건의합니다.",
        "author": "등산러", 
        "latitude": 37.5512, 
        "longitude": 126.9882
    },
    {
        "category": "suggestion", 
        "title": "횡단보도 신설 건의",
        "content": "서초구 반포동 세빛섬 앞 도로에 횡단보도가 없어 보행자가 무단횡단하고 있습니다.",
        "author": "시민B", 
        "latitude": 37.5100, 
        "longitude": 126.9960
    },
    {
        "category": "suggestion", 
        "title": "자전거 거치대 설치 요청",
        "content": "성동구 성수동 카페거리에 자전거 거치대가 부족합니다. 자전거 이용자가 많은 지역입니다.",
        "author": "자전거러", 
        "latitude": 37.5445, 
        "longitude": 127.0567
    },

    # 정보 (info) — 3건
    {
        "category": "info", 
        "title": "이번 주말 벼룩시장 개최",
        "content": "마포구 망원동 망원시장 앞에서 토요일 10시~17시 벼룩시장이 열립니다. 수공예품, 빈티지 의류 등 판매!",
        "author": "마포시민", 
        "latitude": 37.5563, 
        "longitude": 126.9234
    },
    {
        "category": "info", 
        "title": "무료 코딩 교육 안내",
        "content": "용산구 이태원 근처 용산전자상가에서 매주 수요일 저녁 7시 무료 코딩 교육이 진행됩니다.",
        "author": "IT동아리", 
        "latitude": 37.5326, 
        "longitude": 126.9654
    },
    {
        "category": "info", 
        "title": "동네 맛집 추천: 을지로 노포 칼국수",
        "content": "을지로3가역 인근 40년 전통 칼국수 맛집이 있습니다. 평일 점심시간 웨이팅 있으니 참고하세요.",
        "author": "맛집탐험가", 
        "latitude": 37.5660, 
        "longitude": 126.9920
    },
]

def seed_db():
    print("Creating tables if not exists...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded to prevent duplication
        count = db.query(Post).count()
        if count > 0:
            print(f"Database already has {count} posts. Skipping seed.")
            return

        print("Seeding database with initial 10 posts...")
        for post_data in SEED_POSTS:
            post = Post(
                category=post_data["category"],
                title=post_data["title"],
                content=post_data["content"],
                author=post_data["author"],
                latitude=post_data["latitude"],
                longitude=post_data["longitude"]
            )
            db.add(post)
        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
