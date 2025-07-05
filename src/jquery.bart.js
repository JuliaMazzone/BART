
// Plugin BART adaptado para enviar datos a Sheet.best con user_id
(function ($) {
  $.fn.bart = function (b, s) {
    const opts = $.extend({ user_id: "", moneyperpump: 0.05 }, s);
    const results = [];
    let i = 0;

    function simulateTrial() {
      if (i >= b) {
        results.forEach(r => {
          const fecha = new Date().toISOString();
          fetch("https://api.sheetbest.com/sheets/b7d6fc23-3208-49e7-8d03-c07b3fec1f43", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: opts.user_id,
              globo_id: r.id,
              pumps: r.pumps,
              exploded: r.exploded,
              time: r.time,
              fecha: fecha
            })
          }).then(r => r.json()).then(data => console.log("✔️ Enviado:", data));
        });
        return;
      }
      const resultado = {
        id: i + 1,
        pumps: Math.floor(Math.random() * 10 + 1),
        exploded: Math.random() > 0.7 ? "Yes" : "No",
        time: Math.floor(Math.random() * 5000)
      };
      results.push(resultado);
      console.log("Globo", resultado.id, resultado);
      i++;
      setTimeout(simulateTrial, 800);
    }

    simulateTrial();
    return this;
  };
})(jQuery);
