const URL_BASE = "https://api.covid19api.com";

(async () => {
  const summary = await getSummary();
  showDashBoard(summary);
})();

async function getSummary() {
  try {
    const res = await axios.get(`${URL_BASE}/summary`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

function showDashBoard(summary) {
  loadSummary(summary.Global);
  loadChartPie(summary.Global);
  loadChartBar(summary);
}

function loadSummary({ TotalConfirmed, TotalDeaths, TotalRecovered, ...rest }) {
  document.getElementById("confirmed").innerHTML =
    TotalConfirmed.toLocaleString("pt-br");
  document.getElementById("death").innerHTML =
    TotalDeaths.toLocaleString("pt-br");
  document.getElementById("recovered").innerHTML =
    TotalRecovered.toLocaleString("pt-br");

  document.getElementById("date").innerHTML = `Data de atualização: ${new Date(
    rest.Date
  ).toLocaleDateString("pt-br", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}`;
}

function loadChartPie({ NewConfirmed, NewDeaths, NewRecovered }) {
  new Chart(document.querySelector("#pizza"), {
    type: "pie",
    data: {
      labels: ["Confirmados", "Recuperados", "Mortes"],
      datasets: [
        {
          label: "",
          data: [NewConfirmed, NewDeaths, NewRecovered],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
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
          text: "Distribuição de novos casos",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}

function loadChartBar({ Countries }) {
  const top10CountriesSorted = _.take(
    _.orderBy(Countries, ["TotalDeaths", "Country"], ["desc", "asc"]),
    10
  );

  new Chart(document.querySelector("#barras"), {
    type: "bar",
    data: {
      labels: _.map(top10CountriesSorted, "Country"),
      datasets: [
        {
          label: "",
          data: _.map(top10CountriesSorted, "TotalDeaths"),
          backgroundColor: "rgb(153, 102, 255)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Total de morte por país - Top 10",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
