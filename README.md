# Module: PlutoTime

Calculates the next time on a clear morning or evening that you can go outside and experience the brightness of high noon on Pluto.

The code has been obtained from [NASA's](https://science.nasa.gov/dwarf-planets/pluto/plutotime) website on the topic.

## Screenshot

![Screenshot](screenshot.png)

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
	{
		module: 'plutotime',
		position: 'top_right',	// This can be any of the regions.
		header: 'Pluto Time',
		config: {  // Place the latitude and longitude of your mirror
                	latitude: 45.5,
                	longitude: -122.38
		}
	}
]
```
