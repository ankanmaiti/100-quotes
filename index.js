async function fetchQuotes(limit, skip) {
    try {
        const res = await fetch(`https://dummyjson.com/quotes?limit=${limit}&skip=${skip}`)
        return res.json()
    } catch (err) {
        console.log("error from fetch : ", err)
    }
}


function createQuoteCard({ quote, author, id: quoteId }) {
    const cardElement = document.createElement('div')
    const quoteElement = document.createElement('blockquote')
    const authorElement = document.createElement('p')

    cardElement.classList.add('card')
    cardElement.setAttribute('data-count', quoteId)
    quoteElement.setAttribute('cite', `https://dummyjson.com/quotes/${quoteId}`)

    quoteElement.textContent = quote
    authorElement.textContent = author

    cardElement.append(quoteElement, authorElement)

    return cardElement
}


async function appendQuoteToBody(limit, skip) {
    const { quotes, total } = await fetchQuotes(limit, skip)
    if (total <= skip) return false

    quotes.forEach(quote => {
        const cardElement = createQuoteCard( quote )
        document.body.append( cardElement )
    });

    return true
}



async function addInfinteQuotes() {
    const pagination = sessionStorage.getItem('pagination')
    if (!pagination) {
        console.log('No more quotes')
        return
    }

    const { limit, skip } = JSON.parse(pagination)

    const isQuoteExist = await appendQuoteToBody(limit, skip)
    if (isQuoteExist) {
        sessionStorage.setItem('pagination', JSON.stringify({ limit, skip: skip + limit }))
    }
    else {
        sessionStorage.removeItem('pagination')
    }

    const lastQuote = document.body.lastElementChild
    observer.observe(lastQuote)
}


document.body.onload = addInfinteQuotes
sessionStorage.setItem('pagination', JSON.stringify({ limit: 10, skip: 0 }))

const observer = new IntersectionObserver(async entries => {

    const { isIntersecting, target } = entries.pop()
    if (isIntersecting == false) return

    observer.unobserve(target)
    await addInfinteQuotes()

}, {
    rootMargin: "500px"
})