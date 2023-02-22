const axios = require('axios');
const cheerio = require('cheerio');
const download = require('image-downloader');

const DIR = "/Users/jamalwest/Desktop/finvizScreener Results/2-21";

(async function getTickers() {
  try {
    // make axios call to finviz screener
    const response = await axios('https://finviz.com/screener.ashx?v=111&f=cap_microover,sh_avgvol_o1000,sh_curvol_o2000,sh_price_o10,sh_relvol_o1.5,ta_averagetruerange_o1,ta_change_u3&o=price');
    // await html document
    const html = await response.data;

    console.log('Ticker Connection Successful...');

    // parse using cheerio
    const $ = cheerio.load(html);
    const allRows = $('a.screener-link-primary');

    console.log(`${allRows.length} tickers found, parsing now`);

    // create tickers array for return
    let tickers = [];
    allRows.each((index, element) => {
      const ticker = $(element).text();
      tickers.push(ticker);
    });

    console.log(tickers);

    return tickers;
  } catch (error) {
    console.log(error);
  }
})();


(async function getChartUrls() {
  try {
    // make axios call to finviz screener (chart view)
    const response = await axios.get('https://finviz.com/screener.ashx?v=211&f=cap_microover,sh_avgvol_o1000,sh_curvol_o2000,sh_price_o10,sh_relvol_o1.5,ta_averagetruerange_o1,ta_change_u3&o=price');
    // await html document
    const html = await response.data;

    console.log('Chart Connection Successful...');

    // parse using cheerio
    const $ = cheerio.load(html);
    const allCharts = $('img.border-white');

    console.log(`${allCharts.length} charts found, saving imgs now`);

    const imgUrlArray = [];

    allCharts.each((idx, chart) => {
      const chartUrl = $(chart).attr('src');
      imgUrlArray.push(chartUrl);
    });

    // save chart images to DIR directory of choice
    saveChartImgs(imgUrlArray, DIR);

    return imgUrlArray;

  } catch (error) {
    console.log(error);
  }
})();

function saveChartImgs(imgUrls, dir) {

  for (let idx = 0; idx < imgUrls.length; idx++) {
    const Url = imgUrls[idx];
    const options = {
      url: `${Url}`,
      dest: `${dir}/chart_${idx}.jpg`, // will be saved to /path/to/dest/chart_#.jpg
    };

    download.image(options)
      .then(({
        filename
      }) => {
        console.log('Saved to', filename); // saved to /path/to/dest/chart_#.jpg
      })
      .catch((err) => console.error(err));
  }
}