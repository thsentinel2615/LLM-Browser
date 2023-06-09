import asyncio
from crawler import Crawler
from quart import Quart, request, jsonify
import hypercorn.asyncio

app = Quart(__name__)

playwright_instance = None

async def init_crawler():
    global playwright_instance
    playwright_instance = await Crawler.create()
    await playwright_instance.go_to_page('https://www.google.com')

@app.before_serving
async def startup():
    await init_crawler()

@app.after_serving
async def shutdown():
    if playwright_instance:
        await playwright_instance.close()

@app.get('/status')
async def status():
    global playwright_instance
    if playwright_instance:
        return 'PlayWright instance is running'
    else:
        return 'PlayWright instance is not running'
    
@app.post('/search/<query>')
async def search(query):
    global playwright_instance
    if playwright_instance:
        print('Searching for ' + query)
        await playwright_instance.search_google(query)
        return ('Searching for ' + query)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.post('/crawl')
async def crawl():
    global playwright_instance
    if playwright_instance:
        print('Crawling')
        data = "\n".join(await playwright_instance.crawl())
        return data[:4500]
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.post('/page')
async def page():
    data = await request.get_json()
    url = data['url']
    global playwright_instance
    if playwright_instance:
        print('Going to page ' + url)
        await playwright_instance.go_to_page(url)
        return ('Going to page ' + url)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'
    
@app.get('/summarize')
async def summarize():
    global playwright_instance
    if playwright_instance:
        print('Summarizing')
        data = await playwright_instance.summarize_results()
        return data
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'
    
@app.get('/currentpage')
async def currentpage():
    global playwright_instance
    if playwright_instance:
        print('Getting current page')
        url = await playwright_instance.get_page_url()
        return url
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.post('/scroll/<direction>')
async def scroll(direction):
    global playwright_instance
    if playwright_instance:
        print('Scrolling ' + direction)
        await playwright_instance.scroll(direction)
        return ('Scrolling ' + direction)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.post('/click/<selector>')
async def click(selector):
    global playwright_instance
    if playwright_instance:
        print('Clicking ' + selector)
        await playwright_instance.click(selector)
        return ('Clicking ' + selector)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.post('/type/<selector>/<text>')
async def type(selector, text):
    global playwright_instance
    if playwright_instance:
        print('Typing ' + text + ' in ' + selector)
        await playwright_instance.type(selector, text)
        return ('Typing ' + text + ' in ' + selector)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'
    
@app.post('/enter')
async def enter():
    global playwright_instance
    if playwright_instance:
        print('Pressing enter')
        await playwright_instance.enter()
        return ('Pressing enter')
    else:
        return 'PlayWright instance is not running'

@app.get('/screenshot')
async def screenshot():
    global playwright_instance
    if playwright_instance:
        print('Taking screenshot')
        imageData = await playwright_instance.screenshot()
        return jsonify({'image': imageData})
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

if __name__ == '__main__':
    asyncio.run(hypercorn.asyncio.serve(app, hypercorn.Config()))

