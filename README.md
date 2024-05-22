
# GraphQL Organogram

    Projeto base para desenvolvimento da feature de organograma.

#### Clone o repositório para seu ambiente local de desenvolvimento

    git clone git@github.com:danielalves96/graphql-organogram.git

#### Faça a instalação das dependências dos projetos

    cd graphql-organogram

    npm install
    
    cp .env.example .env
    
    cd database
    
    docker compose up -d
    
    cd ../
    
    npx prisma migrate dev --name init
    
    npm run dev

#### Queries e mutations disponíveis
