import sync from 'csv-parse/lib/sync'
import fs from 'fs'

const data = sync(fs.readFileSync('./src/joined.csv'), { columns : true, auto_parse : true })

const bameSample = data.filter(d => d['BAME (%)'] && d['BAME (%)'] > 66)
	.filter(d => d)


const avg = (a, b, i, arr) => a + b/arr.length

console.log(bameSample.length)
console.log(bameSample.map(obj => obj.income).reduce(avg))

let whiteSample = data.filter(d => d['White (%)'] && d['White (%)'] > 66)
.filter(d => d)
.sort(() => Math.random() - 0.5)

const whiteSampleAdj = bameSample.concat(bameSample).map(obj => {

	const index = whiteSample.sort(() => Math.random() - 0.5).findIndex(obj2 => Math.abs(obj2.income - obj.income) < 150)
	const out = whiteSample[index]
	whiteSample.slice(index, 1)
	return out

})

fs.writeFileSync('./src/white_sample.json', JSON.stringify(whiteSampleAdj))

console.log(whiteSampleAdj.map(obj => obj.income).reduce(avg))

fs.writeFileSync('./src/bame_sample.json', JSON.stringify(bameSample))