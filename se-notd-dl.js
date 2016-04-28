#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');
var q = require('q');

var baseUrl = "http://www.svenskaakademien.se";
var url = baseUrl + "/svenska-akademien/almanackan/akademialmanackan/namnlista";
var outputFileName = "notd.json";

var createOutputDataStructure = function () {
  var monthLenghts = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var output = {};
  _.times(12, function (monthNo) {
    var monthOutput = {};
    _.times(monthLenghts[monthNo], function (dayNo) {
      monthOutput[dayNo + 1] = {
        official: [],
        unofficial: []
      };
    });
    output[monthNo + 1] = monthOutput;
  });
  return output;
};

var extractSingleName = function ($) {
  var monthDayRe = /^(\d+)\/(\d+)$/;
  var date = _.trim($.find('td.views-field-field-date-ymd').text());

  return {
    name: _.trim($.find('td.views-field-title').text()),
    month: parseInt(date.replace(monthDayRe, '$2'), 10),
    day: parseInt(date.replace(monthDayRe, '$1'), 10),
    official: _.trim($.find('td.views-field-field-main-name').text()) === 'Ja'
  };
};

var extractNamesFromHtml = function (output, html) {
  console.log("Processing HTML");
  var $ = cheerio.load(html);

  $('div.view-content table tbody tr').each(function () {
    insertSingleNameIntoOutput(output, extractSingleName($(this)));
  });

  var nextPageUrl = findNextPageUrl($);
  if (_.isString(nextPageUrl)) {
    return httpGet(baseUrl + nextPageUrl)
      .then(_.partial(extractNamesFromHtml, output));
  }

  return output;
};

var findNextPageUrl = function ($) {
  return $('ul.pagination li.next.last a').attr('href');
};

var fsWrite = function (filename, data) {
  var deferred = q.defer();
  fs.writeFile(filename, data, function (error) {
    if (error) {
      deferred.reject(error);
    }
    deferred.resolve();
  });
  return deferred.promise;
};

var httpGet = function (url) {
  var deferred = q.defer();
  console.log("Downloading " + url);
  http.get(url, function (res) {
    if (res.statusCode !== 200) {
      deferred.reject(new Error("Unexpected status code: " + res.statusCode));
    }
    else {
      var data = new Buffer(0);
      res.on('error', function (error) {
        deferred.reject(error);
      });
      res.on('data', function (buf) {
        data = Buffer.concat([data, buf]);
      });
      res.on('end', function () {
        if (data && data.length > 0) {
          deferred.resolve(data.toString());
        }
        else {
          deferred.reject(new Error('No data in response'));
        }
      });
      res.resume();
    }
  }).on('error', function (error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

var insertSingleNameIntoOutput = function (output, name) {
  output[name.month][name.day][name.official === true ? 'official' : 'unofficial'].push(name.name);
  output[name.month][name.day][name.official === true ? 'official' : 'unofficial'].sort();
};

httpGet(url)
  .then(_.partial(extractNamesFromHtml, createOutputDataStructure()))
  .then(_.partialRight(JSON.stringify, null, 2))
  .then(_.partial(fsWrite, outputFileName))
  .then(function () {
    console.log('Done');
  })
  .fail(console.error)
  .done();
