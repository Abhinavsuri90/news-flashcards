const NEWS_API_KEY = '1b2c8875a0df40e0b962b99dd84ba9a1';
const GNEWS_API_KEY = '79b263a61b7883dff6096c76d1d7c865';
const UPDATE_INTERVAL = 3600000;


async function fetchCombinedNews(category = 'general') {
    document.getElementById('loading').style.display = 'block';

    const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`;
    const gNewsUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&apikey=${GNEWS_API_KEY}`;

    try {
        const [newsResponse, gNewsResponse] = await Promise.all([
            fetch(newsApiUrl),
            fetch(gNewsUrl)
        ]);

        const [newsData, gNewsData] = await Promise.all([
            newsResponse.json(),
            gNewsResponse.json()
        ]);

        const combinedArticles = [
            ...newsData.articles,
            ...(gNewsData.articles || [])  
        ];

        displayNews(combinedArticles);
        updateLastUpdated();
    } catch (err) {
        console.error('Error fetching news:', err);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function displayNews(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = articles.map(createNewsCard).join('');
}


function createNewsCard(article) {
    const image = article.image || article.urlToImage || 'https://via.placeholder.com/300x200';
    return `
        <div class="news-card">
            <img class="news-image" src="${image}" alt="News">
            <div class="news-content">
                <h3>${article.title}</h3>
                <p>${article.description || 'No description available.'}</p>
                <a href="${article.url}" target="_blank">Read More</a>
            </div>
        </div>
    `;
}


function updateLastUpdated() {
    document.getElementById('lastUpdated').innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
}


document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        fetchCombinedNews(btn.dataset.category);
    });
});


document.querySelector('.search-bar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.news-card').forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const desc = card.querySelector('p').innerText.toLowerCase();
        card.style.display = (title.includes(query) || desc.includes(query)) ? 'block' : 'none';
    });
});


fetchCombinedNews();
setInterval(fetchCombinedNews, UPDATE_INTERVAL);
