import os
import json
import time
import psycopg2
import redis
from prometheus_client import start_http_server, Counter

# Prometheus Metrics
TASKS_PROCESSED = Counter('worker_tasks_processed_total', 'Total tasks processed', ['status'])

# Connections
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
DB_URL = os.getenv('DB_URL', 'postgresql://user:password@localhost:5432/taskflow')

r = redis.Redis.from_url(REDIS_URL)

def get_db_connection():
    return psycopg2.connect(DB_URL)

def process_task(task_data):
    task_id = task_data.get('id')
    task_type = task_data.get('type')
    
    print(f"Processing task {task_id} of type {task_type}")
    time.sleep(2)  # Simulate work
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE tasks SET status = %s WHERE id = %s", ('completed', task_id))
        conn.commit()
        TASKS_PROCESSED.labels(status='success').inc()
        print(f"Task {task_id} completed successfully.")
    except Exception as e:
        conn.rollback()
        TASKS_PROCESSED.labels(status='failed').inc()
        print(f"Failed to update task {task_id}: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Starting worker...")
    # Start Prometheus metrics server
    start_http_server(8000)
    
    while True:
        try:
            # Pop job from Redis queue
            item = r.brpop('task_queue', timeout=5)
            if item:
                _, task_json = item
                task_data = json.loads(task_json)
                process_task(task_data)
        except Exception as e:
            print(f"Worker error: {e}")
            time.sleep(1)
