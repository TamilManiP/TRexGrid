/*!
 * jQuery lightweight plug-in(TRexGrid)
 */
/* Author - Thamizh Mani.P(Software Developer .NET platform) */
// the semi-colon before the function invocation is a safety 
// net against concatenated scripts and/or other plug-ins 
// that are not closed propederly.
;
(function ($, window, document, undefined) {

    // undefined is used here as the undefined global 
    // variable in ECMAScript 3 and is mutable (i.e. it can 
    // be changed by someone else). undefined isn't really 
    // being passed in so we can ensure that its value is 
    // truly undefined. In ES5, undefined can no longer be 
    // modified.
    // window and document are passed through as Local 
    // variables rather than as global's, because this (slightly) 
    // quickens the resolution process and can be more 
    // efficiently minified (especially when both are 
    // regularly referenced in your plug-in).Changed

    var developerDefaults, dt, build, utility, instancePrototypes = {
        _dom: dom,
        _processing:processing,
        _header: header,
        _rowWriter: defaultRowWiter,
        _pagination: pagination
       
    },
        _columns, col, records, datapage,$tbody;

    // Create the plug-in global defaults 
    developerDefaults = {
        features: {
            paginate: !0,
            sort: !0,
            search: !0,
            recordCount: !0,
            design:'awezi'  /* stacked */
        },
        paginate: {
            maxRows: 10,
            activePage: 0
        },
        table: {
            tablefooter: !0,
            tablefooterSumColumn: "unknown",
            defaultColumnIdStyle: 'camelCase',
            columns: [{
                column: "unknown",
                type: "ro"
            }],
            headRowClass: null
        },
        inputs: {
            sorts: null,
            paginationClass: '',
            paginationLinkClass: '',
            paginationPrevClass: '',
            paginationNextClass: '',
            paginationActiveClass: '',
            paginationDisabledClass: '',
            paginationPrev: '',
            paginationNext: '',
            recordCountText: 'Showing ',
            processingText: 'Processing...'
        },
        datasource: {
            ajax: !1,
            ajaxUrl: null,
            ajaxCache: null,
            ajaxOnLoad: !1,
            ajaxMethod: 'GET',
            ajaxDataType: 'json',
            totalRecordCount: null,
            records: null
        }
    };

    dt = {
        init: function (element, options) {
            this.settings = $.extend(true, developerDefaults, options);
            this.element = element;
            this.$element = $(element);
            build.call(this);
            return this;
        }
    };


    build = function () {
        //Automatic Trigger When User Calls The Function(preinit)
        this.$element.trigger('tRexGrid:preinit', this);
        // jQuery has an extend method that merges the 
        // contents of two or more objects, storing the 
        // result in the first object. The first object 
        // is generally empty because we don't want to alter 
        // the default options for future instances of the plug-in
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element 
        // and this.options
        for (Model in instancePrototypes) {
            if (instancePrototypes.hasOwnProperty(Model)) {
                var ModelInstance = this[Model] = new instancePrototypes[Model](this, this.settings);
                if (ModelInstance.initOnLoad()) {
                    ModelInstance.init();
                }
            }
        }
    };

    function dom(obj, settings) {
        this.initOnLoad = function () {
            return obj.$element.is('table');
        };
        this.init = function () {
            obj.$element.wrap($('<div />', {
                id: 'tRexGrid',
                class: 'tRexGrid'
            }));
        };
    }

    function header(obj, settings) {
        this.initOnLoad = function () {
            col = [];
            records = settings.datasource.records;
            for (var i = 0; i < records.length; i+=1) {
                for (var key in records[i]) {
                    if (col.indexOf(key) === -1)
                        col.push(key);

                }
            }
            return true;
        };
        this.init = function () {
            var $thead = $('<thead/>'),
                $tr = $('<tr />');
            obj.$element.append($thead);
            _columns = settings.table.columns;
            for (var h = 0; h < _columns.length; h++) {
                $tr.append(this._headWriter(h, _columns[h].column, col[h], _columns[h].type));
            }
            $thead.append($tr);
        };
        this._headWriter = function (index, header, id, type) {

            var $th = $('<th />', {
                id: id
            });
            if (type == 'hdn')
                $th.addClass("hidden");

            if (settings.table.defaultColumnIdStyle)
                header = utility.normalizeText(header, settings.table.defaultColumnIdStyle);
            if (settings.features.sort) {
                var $span = $('<span class="dropdown"><a href=\"javascript:void(0);\" id="sorticon" class="glyphicon glyphicon-filter"></a><div class="dropdown-content"><a href="#"><span class="glyphicon glyphicon-sort-by-attributes"></span>&nbsp;&nbsp;Sort Asc</a><a href="#"><span class="glyphicon glyphicon-sort-by-attributes-alt"></span>&nbsp;&nbsp;Sort Desc</a></div></span>');
                //var $span = $('<a class="sorticon"><span class="fa fa-filter"></span></a>')
                return $th.text(header).append($span);
            }
            return $th.text(header);
        };
    }

    function defaultRowWiter(obj, settings) {
        this.initOnLoad = function () {
            $tbody = $('<tbody />');
            return true;
        };
        this.init = function () {
            datapage = arguments[0] || 0;
            obj.$element.append($tbody);
            for (var r = datapage * settings.paginate.maxRows; r < (datapage * settings.paginate.maxRows) + settings.paginate.maxRows; r+=1) {
                var fragTrow = $("<tr>", {
                    "class": ""
                }).appendTo($tbody);
                for (var j = 0; j < col.length; j+=1) {
                    $(this._rowWriter(r, j, records[r][col[j]], col[j])).appendTo(fragTrow);
                }
            }
        };
        this._rowWriter = function (rowindex, colindex, cellValue, id) {
            var $td = $('<td  />', {
                id: id,
                style:settings.features.design =='stacked'?'padding-bottom:1px':''
            });
            var colType = {
                'link': function () {
                    return $td.html($('<a id=' + id + ' />', {
                        text: cellValue,
                        href: "#"
                    }));
                },
                'ed': function () {
                    return $td.html('<input type="text" class="edinput" value=' + cellValue + ' id=' + id + '/>');
                },
                'prg': function () {
                    if (!$.isNumeric(cellValue))
                        cellValue = 0

                    var $progressbar = $('<div />').css({
                        "background-color": (cellValue > 50 ? "#FFE01A" : "#E2B842"),
                        height: "20px",
                        "width": cellValue + '%',
                        "text-align": "center",
                        "color": "#012B39"
                    }).text(cellValue);
                    var $progressWrap = $('<div />').css({
                        "background-color": "rgba(255,255,255,0.3)",
                        width: "100%",
                        "text-align": "center"
                    });
                    $progressWrap.html($progressbar);
                    return $td.html($progressWrap);
                },
                'chk': function () {
                    return $td.html('<input id=' + rowindex + '_' + colindex + ' type="checkbox" ' + (cellValue == "1" ? "checked='checked'" : "unchecked='uncheked'") + ' /><label id="checkb" for=' + rowindex + '_' + colindex + '></label>');
                },
                'radio': function () {
                    return $td.html('<label class="radio inline"><input type="radio" name=' + id + ' ' + (cellValue == "1" ? "checked='checked'" : "unchecked='uncheked'") + ' /><span></span></label>');
                },
                'dropdown': function () {
                    if (!$.isNumeric(cellValue))
                        return $td.addClass("err").text(cellValue);
                    else {
                        if (cellValue[0] == '-')
                            return $td.addClass("negation").text(cellValue);
                        else
                            return $td.text(cellValue);
                    }
                },
                'hdn': function () {
                    return $td.addClass("hidden").text(cellValue);
                },
                'ro': function () {
                    return $td.text(cellValue);
                },
                'default': function () {
                    return $td.text(cellValue);
                }
            };
            if (colType[_columns[colindex].type]) {
                return colType[_columns[colindex].type]();
            } else {
                return colType['default']();
            }
        }
    }

    function pagination(obj, settings) {
        this.initOnLoad = function () {
            if (settings.features.paginate) {
                return true;
            }
            return false;
        };

        this.init = function () {
            $('.tRexGrid').after(this._getNavBar());
            clear(),new defaultRowWiter(obj, settings).init(0);
        };
        var clear = function () {
            obj.$element.find('tbody').html('');
            $('.paginglink').find('a').removeClass('active');
        }
        this._getNavBar = function () {
            var nav = $('<div>', {
                class: "paginglink"
            });
            for (var i = 0; i < Math.ceil(records.length / settings.paginate.maxRows) ; i++) {
                if (i < 9) {
                    var $a = $('<a>', {
                        href: '#',
                        text: (i + 1),
                        "data-page": (i),
                    }).bind('click', function (e) {
                        pageClickHandler(e);
                    }).appendTo(nav);
                }
                if (i >= 10) {
                    if (i >= 10 && i < 11) {
                        var $select = $('<select />', { class: 'paginginput' }).bind('change', function () {
                            var pageNum = $('option:selected', this).attr("data-page"); datapage = pageNum, clear(), callback = new defaultRowWiter(obj, settings).init(parseInt(pageNum));
                        }).appendTo(nav);
                    }
                    var $option = $('<option data-page='+i +'>' + i + '</option>').appendTo($select);
                }
            }
            $('<a>', {
                href: '#',
                text: '<',
                "data-direction": -1,
            }).bind('click', function (e) {
                pageStepHandler(e);
            }).prependTo(nav);

            $('<a>', {
                href: '#',
                text: '>',
                "data-direction": +1,
            }).bind('click', function (e) {
                pageStepHandler(e);
            }).appendTo(nav);
            return nav;
        };
        var pageClickHandler = function (event) {
            event.preventDefault();
            clear(), $(event.target).addClass('active');
            var pageNum = $(event.target).attr('data-page');
            callback = new defaultRowWiter(obj, settings).init(pageNum);
        };
        var pageStepHandler = function (event) {
            event.preventDefault();
            clear();
            $(event.target).attr('data-direction') == -1 ? new defaultRowWiter(obj, settings).init(parseInt(datapage) - 1 < 0 ? 0 : parseInt(datapage) - 1) : new defaultRowWiter(obj, settings).init(parseInt(datapage) + 1 < 0 ? 0 : parseInt(datapage) + 1);
        }
    }

    function processing(obj, settings) {
        this.initOnLoad = function () {
            return true;
        };
        this.init = function () {
            this.attach();
        };

        this.create = function () {
            var $processing = $('<div></div>', {
                html: '<span>' + settings.inputs.processingText + '</span>',
                id: 'dynatable-processing-' + obj.element.id,
                'class': 'dynatable-processing',
                style: 'position: absolute; display: none;'
            });

            return $processing;
        };

        this.position = function () {
            var $processing = $('#dynatable-processing-' + obj.element.id),
                $span = $processing.children('span'),
                spanHeight = $span.outerHeight(),
                spanWidth = $span.outerWidth(),
                $covered = obj.$element,
                offset = $covered.offset(),
                height = $covered.outerHeight(), width = $covered.outerWidth();

            $processing
              .offset({ left: offset.left, top: offset.top })
              .width(width)
              .height(height)
            $span
              .offset({ left: offset.left + ((width - spanWidth) / 2), top: offset.top + ((height - spanHeight) / 2) });

            return $processing;
        };

        this.attach = function () {
            obj.$element.before(this.create());
        };

        this.show = function () {
            $('#dynatable-processing-' + obj.element.id).show();
            this.position();
        };

        this.hide = function () {
            $('#dynatable-processing-' + obj.element.id).hide();
        };
    }

    utility = dt.utility = {

        normalizeText: function (text, style) {
            text = this.textTransform[style](text);
            return text;
        },
        textTransform: {
            trimDash: function (text) {
                return text.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "-");
            },
            camelCase: function (text) {
                return text;
            }
        }

    };

    // Object.create support test, and fall-back for browsers without it
    if (typeof Object.create !== "function") {
        Object.create = function (o) {
            function F() { }
            F.prototype = o;
            return new F();
        };
    }

    //seperate grid configuration
    $.tRexGridConfig = function (options) {
        this.options = $.extend({}, developerDefaults, options);
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.tRexGrid = function (object) {
        $.fn['tRexGrid'] = function (options) {
            return this.each(function () {
                if (!$.data(this, 'tRexGrid')) {
                    $.data(this, 'tRexGrid', new object.init(this, options));
                }
            });
        }
    }
    $.tRexGrid(dt);

})(jQuery, window, document);
