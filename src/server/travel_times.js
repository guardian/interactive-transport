import fs from 'fs'
import throttle from 'throttle-promise'
import fetch from 'node-fetch'

const key = 'd2cd12698d81eba64d0029c681c024c0'
const key2 = '55c07de5f5891f58ebe34dacb5ca6f92'

const tflKey = 'c4864735bceb71c69a941e2efb5d44ce'
const tflId = 'a5461e28'

const geo = JSON.parse(fs.readFileSync('./src/server/centroids.json'))

const poi = JSON.parse(fs.readFileSync('./src/server/poi.json'))

const slowFetch = throttle(fetch, 1, 10*1000)

const whiteSample = JSON.parse(fs.readFileSync('./src/white_sample.json'))
const bameSample = JSON.parse(fs.readFileSync('./src/bame_sample.json'))

const whiteSampleCodes = whiteSample.map( obj => obj.code )
const bameSampleCodes = bameSample.map( obj => obj.code )

console.log(whiteSampleCodes.length)
console.log(bameSampleCodes.length)

function round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

const allCentroids = geo.features
	.map(f => {
		return {
			code : f.properties.MSOA11CD,
			coords : f.geometry.coordinates.map(d => round(d, 5))
		}
	})

console.log('whiteSampleCodes', whiteSampleCodes.length)

const centroids = allCentroids
	.filter( f => whiteSampleCodes.indexOf(f.code) >= 0 || bameSampleCodes.indexOf(f.code) >= 0  )
	.map( f => Object.assign({}, f, { group : whiteSampleCodes.indexOf(f.code) >= 0 ? 'white' : 'bame' }))

console.log('bameSampleCodes', bameSampleCodes.length)

//console.log(whiteSampleCodes.filter(c => allCentroids.map(f => f.code).indexOf(c) < 0))

// const poi = [

// 	[
// 		-0.1229095458984375,	// KX
// 		51.53045276192664
// 	],
// 	[
// 		-0.1415133476257324,	// oxford circus
// 		51.5152860135492

// 	],
// 	[
// 		-0.0997781753540039,  // st bartholomew's hospital
// 		51.516995195468446
// 	],
// 	[
// 		-0.17631769180297852,	// imperial college
// 		51.49555901643561
// 	],
// 	[
// 		-0.10316848754882811,  // finsbury park
// 		51.567093777067655
// 	],
// 	[
// 		-0.09939193725585936,	// tate modern
// 		51.50750041269507
// 	],
// 	[
// 		-0.28191089630126953,	// wembley stadium
// 		51.55495453943255
// 	],
// 	[
// 		-0.11690139770507812,	// st thomas' hospital
// 		51.49952647167268
// 	]

// ].map(t => t.map(d => round(d, 5)))

const time = '2018-04-04T08:00:02-0500'

const total = centroids.length*poi.length

let i = 0

let out = []

centroids.slice().sort(() => Math.random() - 0.5).forEach(c => {

	const a = c.coords.slice().reverse().join(',')

	poi.forEach((p, j) => {

		const b = round(p.lat, 5) + ',' + round(p.lng, 5)

		//const url = `https://developer.citymapper.com/api/1/traveltime/?time_type=arrival&time=${time}&startcoord=${a}&endcoord=${b}&key=${key}`

		const url = `https://api.tfl.gov.uk/journey/journeyresults/${a}/to/${b}?date=${20180410}&time=0800&app_id=${tflId}&app_key=${tflKey}`

		//console.log(url)

		slowFetch(url).then( resp => {
				return resp.text()
			})
			.then(text => {

				console.log(text.slice(0, 20) + '...')

				const obj = JSON.parse(text)

				i++

				console.log(`${i}/${total}`, c.code)

				if(!obj.journeys || obj.journeys.length === 0) { console.log('err for', url) }

				const times = obj.journeys.map(j => j.duration)

				out.push( { code : c.code, poi : p, times, group : c.group } )

				// if(!obj.travel_time_minutes) {

				// 	console.log(obj)

				// }

				fs.writeFileSync('./src/server/times_new_box.json', JSON.stringify(out, null, 2))	

			})
	})


})