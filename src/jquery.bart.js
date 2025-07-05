
/* Plugin BART funcional con integración a Sheet.best y soporte para user_id */
(function ($) {
  $.fn.bart = function (b, s) {
    const settings = $.extend({
      minpumps: 1,
      maxpumps: 64,
      moneyperpump: 0.05,
      delay: 200,
      showpumpcount: true,
      showballooncount: true,
      showcurrentearned: true,
      showtotalearned: true,
      bgcol: "#ffffff",
      txt_balloon_number: "Balloon: ",
      txt_number_of_pumps: "Pumps: ",
      txt_current_earned: "Current: ",
      txt_total_earned: "Total: ",
      txt_inflate: "Inflate",
      txt_cashin: "Cash In",
      txt_next: "Next",
      txtEnd: "Done",
      user_id: "",
      onload: null,
      oninflate: null,
      onexplosion: null,
      oncashin: null,
      onend: null
    }, s);

    const $container = $(this);
    const canvas = $("<canvas width='500' height='400'></canvas>");
    const pumpButton = $("<button>" + settings.txt_inflate + "</button>");
    const cashinButton = $("<button>" + settings.txt_cashin + "</button>");
    const balloonInfo = $("<div></div>");
    let context = canvas[0].getContext("2d");

    let currentBalloon = 0;
    let pumps = 0;
    let popped = false;
    let totalEarnings = 0;
    let balloonData = [];

    function drawBalloon(scale) {
      context.clearRect(0, 0, 500, 400);
      context.beginPath();
      context.arc(250, 200, 20 + scale * 3, 0, 2 * Math.PI);
      context.fillStyle = "red";
      context.fill();
    }

    function startBalloon() {
      if (currentBalloon >= b) {
        $container.html("<h2>" + settings.txtEnd + "</h2>");
        if (settings.onend) settings.onend();
        sendAllData();
        return;
      }

      pumps = 0;
      popped = false;
      drawBalloon(pumps);
      updateInfo();
    }

    function updateInfo() {
      balloonInfo.html(
        settings.txt_balloon_number + (currentBalloon + 1) + " / " + b +
        "<br>" + settings.txt_current_earned + (pumps * settings.moneyperpump).toFixed(2) +
        "<br>" + settings.txt_number_of_pumps + pumps +
        "<br>" + settings.txt_total_earned + totalEarnings.toFixed(2)
      );
    }

    function explodeBalloon() {
      popped = true;
      drawBalloon(0);
      balloonData.push({
        id: currentBalloon + 1,
        pumps: pumps,
        exploded: "Yes",
        time: -9
      });
      currentBalloon++;
      setTimeout(startBalloon, 1000);
    }

    function cashInBalloon() {
      totalEarnings += pumps * settings.moneyperpump;
      balloonData.push({
        id: currentBalloon + 1,
        pumps: pumps,
        exploded: "No",
        time: -9
      });
      currentBalloon++;
      startBalloon();
    }

    function sendAllData() {
      const now = new Date();
      const fecha = now.toISOString();
      balloonData.forEach(res => {
        fetch("https://api.sheetbest.com/sheets/b7d6fc23-3208-49e7-8d03-c07b3fec1f43", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: settings.user_id,
            globo_id: res.id,
            pumps: res.pumps,
            exploded: res.exploded,
            time: res.time,
            fecha: fecha
          })
        }).then(res => res.json()).then(d => console.log("Enviado:", d));
      });
    }

    pumpButton.click(() => {
      if (popped) return;
      pumps++;
      drawBalloon(pumps);
      updateInfo();
      const explodeChance = pumps / settings.maxpumps;
      if (Math.random() < explodeChance) explodeBalloon();
    });

    cashinButton.click(() => {
      if (!popped) cashInBalloon();
    });

    $container.append(canvas, pumpButton, cashinButton, balloonInfo);

    if (settings.onload) settings.onload();
    startBalloon();

    return this;
  };
})(jQuery);
