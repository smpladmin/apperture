#!/bin/bash

echo "Pulling .env for frontend" && cd frontend && /bin/bash getenv.sh && cd ..
echo "Pulling .env for backend" && cd backend && /bin/bash getenv.sh && cd ..
echo "Pulling .env for data_processor" && cd data_processor && /bin/bash getenv.sh && cd ..
echo "Pulling .env for scheduler" && cd scheduler && /bin/bash getenv.sh && cd ..
