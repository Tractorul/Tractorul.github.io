// Portfolio Gallery Manifest
const GALLERY_DATA = [
    {
        id: "tram-1",
        src: "images/1.jpg",
        alt: "Bucharest public transport tram in urban movement",
        title: "Urban Tram in Transit",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["tram", "transit", "bucharest", "stb", "street", "sony"]
    },
    {
        id: "street-2",
        src: "images/2.jpg",
        alt: "Urban street photography scene in Bucharest",
        title: "Bucharest Street Perspective",
        category: "urban",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 35mm f/1.8G",
        location: "Bucharest, Romania",
        tags: ["urban", "street", "architecture", "city", "nikon"]
    },
    {
        id: "bus-3",
        src: "images/3.jpg",
        alt: "Public transit bus navigating city streets",
        title: "City Bus Route",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["bus", "transit", "public transport", "stb", "city"]
    },
    {
        id: "tram-4",
        src: "images/4.jpg",
        alt: "Modern tram architectural lines and urban transit",
        title: "Transit Lines & Geometry",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["tram", "transit", "geometry", "urban", "architecture"]
    },
    {
        id: "arch-5",
        src: "images/5.jpg",
        alt: "City architecture and street perspective",
        title: "Bucharest Urban Lines",
        category: "urban",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Bucharest, Romania",
        tags: ["architecture", "urban", "street", "nikon", "perspective"]
    },
    {
        id: "transit-6",
        src: "images/6.jpg",
        alt: "Public transport vehicle in Bucharest",
        title: "Urban Commute",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["transit", "commute", "bucharest", "stb", "motion"]
    },
    {
        id: "urban-7",
        src: "images/7.jpg",
        alt: "Urban transportation geometry and reflections",
        title: "City Reflections & Transit",
        category: "urban",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 35mm f/1.8G",
        location: "Bucharest, Romania",
        tags: ["reflections", "urban", "geometry", "nikon", "street"]
    },
    {
        id: "transit-8",
        src: "images/8.jpg",
        alt: "City transit line framed by urban architecture",
        title: "Framed Transit",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["transit", "framing", "urban", "architecture", "sony"]
    },
    {
        id: "urban-9",
        src: "images/9.jpg",
        alt: "Bucharest street life and public transit",
        title: "Bucharest Rhythm",
        category: "urban",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Bucharest, Romania",
        tags: ["urban", "city life", "street", "bucharest", "nikon"]
    },
    {
        id: "astra-imperio",
        src: "images/astra.jpg",
        alt: "Astra Imperio tram operating on Bucharest transit lines",
        title: "Astra Imperio Tram",
        category: "transit",
        camera: "Sony NEX-3N",
        lens: "E PZ 16-50mm F3.5-5.6 OSS",
        location: "Bucharest, Romania",
        tags: ["astra", "imperio", "tram", "transit", "stb", "green", "modern"]
    },
    {
        id: "urban-andreuptm",
        src: "images/andreuptm.jpg",
        alt: "Urban photography detail by andreuptm",
        title: "Urban Perspective Detail",
        category: "urban",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 35mm f/1.8G",
        location: "Bucharest, Romania",
        tags: ["urban", "architecture", "detail", "andreuptm", "nikon"]
    },
    {
        id: "bias-1",
        src: "images/bias 1.jpg",
        alt: "BIAS Bucharest International Airshow aircraft display",
        title: "BIAS Airshow Display",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "airshow", "aircraft", "aerobatics", "nikon", "baneasa"]
    },
    {
        id: "bias-2",
        src: "images/bias 2.jpg",
        alt: "BIAS airshow fighter jet in flight",
        title: "Fighter Jet Maneuver",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "jet", "fighter", "flight", "airshow", "nikon"]
    },
    {
        id: "bias-3",
        src: "images/bias 3.jpg",
        alt: "Aviation photography at Bucharest International Airshow",
        title: "Sky High Aerobatics",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "aerobatics", "sky", "plane", "nikon"]
    },
    {
        id: "bias-4",
        src: "images/bias 4.jpg",
        alt: "Military aircraft performing flight maneuvers at BIAS",
        title: "Military Flight Dynamics",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "military", "aircraft", "maneuver", "nikon"]
    },
    {
        id: "bias-5",
        src: "images/bias 5.jpg",
        alt: "Aerobatic flight display at BIAS Airshow",
        title: "Smoke Trail Formation",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "smoke", "formation", "aerobatics", "nikon"]
    },
    {
        id: "bias-6",
        src: "images/bias 6.jpg",
        alt: "Airplane flight demonstration at BIAS",
        title: "Flight Demonstration",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "flight", "plane", "nikon"]
    },
    {
        id: "bias-7",
        src: "images/bias 7.jpg",
        alt: "Aviation exhibition aircraft at Bucharest Airshow",
        title: "Static Airshow Display",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "exhibition", "aircraft", "nikon"]
    },
    {
        id: "bias-8",
        src: "images/bias 8.jpg",
        alt: "Helicopter flight demonstration at BIAS",
        title: "Helicopter Flight Display",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "helicopter", "rotor", "flight", "nikon"]
    },
    {
        id: "bias-9",
        src: "images/bias 9.jpg",
        alt: "Jet formation flight overhead at BIAS",
        title: "Overhead Jet Formation",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "formation", "jet", "speed", "nikon"]
    },
    {
        id: "bias-10",
        src: "images/bias 10.jpg",
        alt: "Aviation detail shot at Bucharest Airshow",
        title: "Aviation Geometry & Detail",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "cockpit", "detail", "nikon"]
    },
    {
        id: "bias-11",
        src: "images/bias 11.jpg",
        alt: "Airshow plane soaring through blue sky",
        title: "Blue Sky Climb",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "climb", "sky", "plane", "nikon"]
    },
    {
        id: "bias-12",
        src: "images/bias 12.jpg",
        alt: "Spectacular aviation maneuver at BIAS Bucharest",
        title: "Acrobatic Apex",
        category: "aviation",
        camera: "Nikon D7000",
        lens: "AF-S DX NIKKOR 18-105mm f/3.5-5.6G",
        location: "Băneasa Airport, Bucharest",
        tags: ["aviation", "bias", "aerobatics", "maneuver", "smoke", "nikon"]
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GALLERY_DATA;
}
