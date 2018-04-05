import templateHTML from "./src/templates/main.html!text"
import sync from 'csv-parse/lib/sync'
import scatter from 'interactive-scatterplots'
import fs from 'fs'

export async function render() {
	// this function just has to return a string of HTML
	// you can generate this using js, e.g. using Mustache.js


	const data = sync(fs.readFileSync('./src/joined.csv'), { columns : true, auto_parse : true })
		.filter(row => row['BAME (%)'])

	console.log(data.length)

	const plot = scatter.plot(data, 'BAME (%)', 'income', {
		width: 620,
		height: 620,
		fitLine : true
	})

    return plot;
}