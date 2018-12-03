const axios = require('axios'); // Клиент HTTP на основе обещаний для браузера и node.js
const Promise = require('bluebird');
const geolib = require('geolib'); // Небольшая библиотека, обеспечивающая некоторые основные гео-функции, такие как вычисление расстояния, преобразование десятичных координат в полевые и наоборот и т. Д.
//Как говорилось ранее, await ожидает любой Promise.
// Проводя аналогию с работой объекта Promise, можно сказать, что await выполняет точно такую же функцию что и его метод .then().
// Единственная существенная разница в том, что она не требует никаких callback функций для получения и обработки результата.
// Собственно за счет этого и создается впечатление что код выполняется синхронно.

//Использование слова await сигнализирует о том, что бы основной код ждал и не возвращал ответ, пока не выполниться какое-то действие.
// Оно просто обрабатывает Promise для нас и ждет пока он вернет resolve или reject. Таким образом, создается впечатление, что код выполняется синхронно.
(async () => {
    console.log('1. С помощью Geocode.XYZ API отправим параллельные запросы на информацию о городах - Минск, Мадрид, Рим. Из ответов выведем соответствия город - страна');
    (await Promise.all([
        axios.get('https://geocode.xyz/Minsk?json=1'),
        axios.get('https://geocode.xyz/Madrid?json=1'),
        axios.get('https://geocode.xyz/Rome?json=1')
    ])).forEach((data) => {
        data = data.data.standard;
        console.log(`${data.city} - ${data.countryname}`);
    });

    console.log('2. С помощью Promise.any получим страну этих городов - Париж, Ницца');
    console.log((await Promise.any([
        axios.get('https://geocode.xyz/Paris?json=1'),
        axios.get('https://geocode.xyz/Nice?json=1')
    ])).data.standard.countryname);

    console.log('3. С помощью Geocode.XYZ API отправим параллельные запросы на информацию о городах - Брест и Минск. С помощью geolib вычислим расстояние между ними');
    await Promise.all([
        axios.get('https://geocode.xyz/Brest?json=1&region=BY'),
        axios.get('https://geocode.xyz/Minsk?json=1')
    ]).then((data) => {
        console.log(`Result = ${
            geolib.getPathLength([
                {latitude: data[0].data.longt, longitude: data[0].data.latt},
                {latitude: data[1].data.longt, longitude: data[1].data.latt}
            ])
            } meters`);
    });

    console.log('4. С помощью Geocode.XYZ API и Promise.mapSeries отправим последовательные запросы на информацию о городах - Минск, Копенгаген, Осло, Брюссель. С помощью geolib.findNearest найдем ближаший к Минску город');
    Promise.mapSeries([
        axios.get('https://geocode.xyz/Minsk?json=1'),
        axios.get('https://geocode.xyz/Copenhagen?json=1'),
        axios.get('https://geocode.xyz/Oslo?json=1'),
        axios.get('https://geocode.xyz/Brussels?json=1')
    ], (a) => { return a; }).then((data) => {
        let arr = [
            {latitude: data[1].data.longt, longitude: data[1].data.latt},
            {latitude: data[2].data.longt, longitude: data[2].data.latt},
            {latitude: data[3].data.longt, longitude: data[3].data.latt}
        ];
        console.log(`Result = ${
            data[
            parseInt(geolib.findNearest(
                {latitude: data[0].data.longt, longitude: data[0].data.latt},
                arr
            ).key) + 1
                ].data.standard.city
            }`);
    });
})();
