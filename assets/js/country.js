const URL_BASE = "https://api.covid19api.com";

const date_start = document.querySelector("#date_start");
const date_end = document.querySelector("#date_end");
const cmbCountry = document.getElementById("cmbCountry");
const cmbData = document.querySelector("#cmbData");
const btnFilter = document.querySelector("#filtro");

(async () => {
  const countries = await getCountries();
  loadCountries(countries);
  enableFilters();
})();

async function getCountries() {
  const res = await axios.get(`${URL_BASE}/countries`);
  return res.data;
}

function loadCountries(countries) {
  for (country of _.orderBy(countries, "Country", "asc")) {
    cmbCountry.options.add(
      new Option(
        country.Country,
        country.Slug,
        country.Country === "Brazil",
        country.Country === "Brazil"
      )
    );
  }
}

function enableFilters() {
  date_start.disabled = false;
  date_end.disabled = false;
  cmbCountry.disabled = false;
  cmbData.disabled = false;
  btnFilter.disabled = false;

  btnFilter.addEventListener("click", filters);
}

async function filters() {
  if (!date_start.value) {
    alert("Informe a data de início!");
    return;
  }

  if (!date_end.value) {
    alert("Informe a data final!");
    return;
  }

  if (new Date(date_start.value) > new Date(date_end.value)) {
    alert("A Data de início deve ser menor que a data final!");
    return;
  }

  if (new Date(date_start.value) > new Date(date_end.value)) {
    alert("A Data de início não pode ser igual a data final!");
    return;
  }

  const startDate = new Date(date_start.value).addDays(-1).toISOString();
  const endDate = new Date(date_end.value).toISOString();

  const data = await getByCountryAllStatus(
    cmbCountry.value,
    startDate,
    endDate
  );
  showResults(data);
}

async function getByCountryAllStatus(country, startDate, endDate) {
  const urlWithFilters = `${URL_BASE}/country/${country}?from=${startDate}&to=${endDate}`;
  const res = await axios.get(urlWithFilters);
  return res.data;
}

function showResults(data) {
  showKpis(data);
  showChartLine(data);
}

function showKpis(data) {
  const lastObj = _.last(data);

  const kpiconfirmed = document.getElementById("kpiconfirmed");
  kpiconfirmed.innerHTML = lastObj.Confirmed.toLocaleString("pt-br");

  const kpideaths = document.getElementById("kpideaths");
  kpideaths.innerHTML = lastObj.Deaths.toLocaleString("pt-br");

  const kpirecovered = document.getElementById("kpirecovered");
  kpirecovered.innerHTML = lastObj.Recovered.toLocaleString("pt-br");
}

function showChartLine(data) {
  const chartStatus = Chart.getChart("linhas");
  if (chartStatus != undefined) chartStatus.destroy();

  const data1 = data.slice(1);

  const dataType = cmbData.value;

  const avg =
    (_.last(data1)[dataType] - _.first(data)[dataType]) / _.size(data1);

  const newData = data1.map((item, index) => {
    return {
      date: item.Date.slice(0, 10),
      dataType: item[dataType] - data[index][dataType],
      avg,
    };
  });

  new Chart(document.querySelector("#linhas"), {
    type: "line",
    data: {
      labels: _.map(newData, "date"),
      datasets: [
        {
          label: "Número de mortes",
          data: _.map(newData, "dataType"),
          backgroundColor: "rgb(255, 140, 13)",
        },
        {
          label: "Média de mortes",
          data: _.map(newData, "avg"),
          backgroundColor: "#972222",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Curva diária de Covid-19",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}

Date.prototype.addDays = function (days) {
  this.setDate(this.getDate() + parseInt(days));
  return this;
};
