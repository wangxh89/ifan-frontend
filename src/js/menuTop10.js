function menuTop10() {
  var titleOpt = {showBackBtn: true, title: '菜谱Top10', showMoreBtn: false};
  var headerHtml = HeaderMgr.createTitle(titleOpt);
  var menuTop10PageHtml = '<div class="page">' + headerHtml + $("#tplMenuTop10").html() + '</div>';

  fish.PageSlider.slidePage($(menuTop10PageHtml), function () {
    GLOBAL.async('menu', 'qryTop10', null, function (data) {
      if (data.rs) {
        var orderedResult = data.msg;
        $.each(orderedResult, function (i1, menuItem) {
          menuItem['good'] = menuItem['good'] ? menuItem['good'] : 0;
          menuItem['bad'] = menuItem['bad'] ? menuItem['bad'] : 0;
        });
        var menuNameArray = [];
        var menuGoodArray = [];
        for (var i = 0; i < orderedResult.length && i < 10; i++) {
          var o = {
            value: orderedResult[i].menuname,
            textStyle: {
              fontFamily: "Microsoft YaHei",
              fontSize: 14,
              color: "#595a5c"
            }
          };
          menuNameArray.push(o);
          menuGoodArray.push(orderedResult[i].good);

        }
        ;
        console.log(menuNameArray);
        var myChart = echarts.init(document.getElementById('divTop10'));
        myChart.setOption({
          tooltip: {
            trigger: 'axis',
            textStyle: {
              fontFamily: "Microsoft YaHei",
              fontSize: 14
            }
          },
          grid: {
            x: 80,
            width: 250,
            borderWidth: 0
          },
          xAxis: [
            {
              type: 'value',
              axisLine: {
                show: false
              },
              splitLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                show: false
              },
              splitArea: {
                show: false
              }
            }
          ],
          yAxis: [
            {
              type: 'category',
              data: menuNameArray.reverse(),
              axisLine: {
                show: false
              },
              splitLine: {
                show: false
              },
              splitArea: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              name: '赞',
              type: 'bar',
              data: menuGoodArray.reverse(),
              barWidth: 40,
              itemStyle: {
                normal: {
                  color: "#4ad584"
                }
              },
              barWidth: 30
            }
          ]
        });
      }
    }, function (err) {
      console.log(err);
      alert(err);
    });
  });
}