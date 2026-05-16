const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 5000

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url)
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      fs.readFile(path.join(__dirname, 'index.html'), (e, d) => {
        res.end(d)
      })
      return
    }
    const ext = path.extname(filePath)
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' })
    res.end(data)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
