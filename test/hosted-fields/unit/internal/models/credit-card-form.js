'use strict';

var assign = require('../../../../../src/lib/assign').assign;
var CreditCardForm = require('../../../../../src/hosted-fields/internal/models/credit-card-form').CreditCardForm;
var getCardTypes = require('../../../../../src/hosted-fields/shared/get-card-types');
var nextYear = (new Date().getFullYear() + 1).toString();
var events = require('../../../../../src/hosted-fields/shared/constants').events;
var externalEvents = require('../../../../../src/hosted-fields/shared/constants').externalEvents;
var validator = require('card-validator');

describe('credit card model', function () {
  beforeEach(function () {
    this.card = new CreditCardForm(helpers.getModelConfig([
      'number',
      'cvv',
      'expirationDate',
      'postalCode'
    ]));
  });

  it('starts with empty values', function () {
    expect(this.card.get('number').value).to.equal('');
    expect(this.card.get('cvv').value).to.equal('');
    expect(this.card.get('expirationDate').value).to.equal('');
    expect(this.card.get('postalCode').value).to.equal('');
  });

  describe('constructor()', function () {
    beforeEach(function () {
      this.sandbox.stub(CreditCardForm.prototype, 'on');
    });

    describe('_fieldKeys', function () {
      it('sets a _fieldKeys property', function () {
        var cardForm = new CreditCardForm(helpers.getModelConfig());

        expect(cardForm._fieldKeys).to.exist;
      });

      it('assigns only allowed fields', function () {
        var cardForm = new CreditCardForm(helpers.getModelConfig([
          'number',
          'foo'
        ]));

        expect(cardForm._fieldKeys).to.deep.equal(['number']);
      });
    });

    it('sets a configuration property', function () {
      var configuration = helpers.getModelConfig();
      var cardForm = new CreditCardForm(configuration);

      expect(cardForm.configuration).to.equal(configuration);
    });

    it('does not set supportedCardTypes when not specified', function () {
      var configuration = helpers.getModelConfig();

      this.sandbox.stub(CreditCardForm.prototype, 'setSupportedCardTypes');

      new CreditCardForm(configuration); // eslint-disable-line no-new

      expect(CreditCardForm.prototype.setSupportedCardTypes).to.not.be.called;
    });

    it('does set supportedCardTypes when specified', function () {
      var configuration = helpers.getModelConfig();

      configuration.supportedCardTypes = ['VISA'];

      this.sandbox.stub(CreditCardForm.prototype, 'setSupportedCardTypes');

      new CreditCardForm(configuration); // eslint-disable-line no-new

      expect(CreditCardForm.prototype.setSupportedCardTypes).to.be.calledOnce;
      expect(CreditCardForm.prototype.setSupportedCardTypes).to.be.calledWith(['VISA']);
    });

    it('attaches change events for each field (cvv only)', function () {
      var configuration = helpers.getModelConfig();
      var cardForm = new CreditCardForm(configuration);

      expect(cardForm.on.callCount).to.equal(8);

      // CVV is the only field by default
      expect(cardForm.on.getCall(0).args[0]).to.equal('change:cvv.value');
      expect(cardForm.on.getCall(0).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(1).args[0]).to.equal('change:cvv.isFocused');
      expect(cardForm.on.getCall(1).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(2).args[0]).to.equal('change:cvv.isEmpty');
      expect(cardForm.on.getCall(2).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(3).args[0]).to.equal('change:cvv.isValid');
      expect(cardForm.on.getCall(3).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(4).args[0]).to.equal('change:cvv.isPotentiallyValid');
      expect(cardForm.on.getCall(4).args[1]).to.be.an.instanceof(Function);

      expect(cardForm.on.getCall(5).args[0]).to.equal('change:number.value');
      expect(cardForm.on.getCall(5).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(6).args[0]).to.equal('change:possibleCardTypes');
      expect(cardForm.on.getCall(6).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(7).args[0]).to.equal('change:possibleCardTypes');
      expect(cardForm.on.getCall(7).args[1]).to.be.an.instanceof(Function);
    });

    it('attaches change events for each field', function () {
      var configuration = helpers.getModelConfig([
        'number',
        'cvv',
        'expirationDate'
      ]);
      var cardForm = new CreditCardForm(configuration);

      expect(cardForm.on.callCount).to.equal(18);

      expect(cardForm.on.getCall(0).args[0]).to.equal('change:number.value');
      expect(cardForm.on.getCall(0).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(1).args[0]).to.equal('change:number.isFocused');
      expect(cardForm.on.getCall(1).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(2).args[0]).to.equal('change:number.isEmpty');
      expect(cardForm.on.getCall(2).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(3).args[0]).to.equal('change:number.isValid');
      expect(cardForm.on.getCall(3).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(4).args[0]).to.equal('change:number.isPotentiallyValid');
      expect(cardForm.on.getCall(4).args[1]).to.be.an.instanceof(Function);

      expect(cardForm.on.getCall(5).args[0]).to.equal('change:cvv.value');
      expect(cardForm.on.getCall(5).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(6).args[0]).to.equal('change:cvv.isFocused');
      expect(cardForm.on.getCall(6).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(7).args[0]).to.equal('change:cvv.isEmpty');
      expect(cardForm.on.getCall(7).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(8).args[0]).to.equal('change:cvv.isValid');
      expect(cardForm.on.getCall(8).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(9).args[0]).to.equal('change:cvv.isPotentiallyValid');
      expect(cardForm.on.getCall(9).args[1]).to.be.an.instanceof(Function);

      expect(cardForm.on.getCall(10).args[0]).to.equal('change:expirationDate.value');
      expect(cardForm.on.getCall(10).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(11).args[0]).to.equal('change:expirationDate.isFocused');
      expect(cardForm.on.getCall(11).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(12).args[0]).to.equal('change:expirationDate.isEmpty');
      expect(cardForm.on.getCall(12).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(13).args[0]).to.equal('change:expirationDate.isValid');
      expect(cardForm.on.getCall(13).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(14).args[0]).to.equal('change:expirationDate.isPotentiallyValid');
      expect(cardForm.on.getCall(14).args[1]).to.be.an.instanceof(Function);

      expect(cardForm.on.getCall(15).args[0]).to.equal('change:number.value');
      expect(cardForm.on.getCall(15).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(16).args[0]).to.equal('change:possibleCardTypes');
      expect(cardForm.on.getCall(16).args[1]).to.be.an.instanceof(Function);
      expect(cardForm.on.getCall(17).args[0]).to.equal('change:possibleCardTypes');
      expect(cardForm.on.getCall(17).args[1]).to.be.an.instanceof(Function);
    });
  });

  describe('resetAttributes', function () {
    beforeEach(function () {
      this.scope = {
        _fieldKeys: ['number', 'cvv', 'expirationMonth', 'expirationYear'],
        getCardTypes: CreditCardForm.prototype.getCardTypes,
        configuration: {
          fields: {
            number: {},
            cvv: {},
            expirationMonth: {},
            expirationYear: {}
          }
        }
      };

      this.emptyProperty = {
        value: '',
        isFocused: false,
        isValid: false,
        isPotentiallyValid: true,
        isEmpty: true
      };
    });

    it('returns the right object for each field', function () {
      expect(this.card.resetAttributes()).to.deep.equal({
        number: this.emptyProperty,
        cvv: this.emptyProperty,
        expirationDate: this.emptyProperty,
        postalCode: this.emptyProperty,
        possibleCardTypes: this.scope.getCardTypes('')
      });
    });

    it('sets expiration month to current month if using a <select> and no placeholder', function () {
      var currentMonth = ((new Date()).getMonth() + 1).toString();

      this.scope.configuration.fields.expirationMonth = {select: true};

      expect(CreditCardForm.prototype.resetAttributes.call(this.scope).expirationMonth).to.deep.equal({
        value: currentMonth,
        isFocused: false,
        isValid: true,
        isPotentiallyValid: true,
        isEmpty: false
      });
    });

    it('sets expiration year to current year if using a <select> and no placeholder', function () {
      var currentYear = (nextYear - 1).toString();

      this.scope.configuration.fields.expirationYear = {select: true};

      expect(CreditCardForm.prototype.resetAttributes.call(this.scope).expirationYear).to.deep.equal({
        value: currentYear,
        isFocused: false,
        isValid: true,
        isPotentiallyValid: true,
        isEmpty: false
      });
    });

    it('sets expiration month to empty if using a <select> and a placeholder', function () {
      this.scope.configuration.fields.expirationMonth = {
        select: true,
        placeholder: 'expiration month placeholder'
      };
      expect(CreditCardForm.prototype.resetAttributes.call(this.scope).expirationMonth).to.deep.equal(this.emptyProperty);
    });

    it('sets expiration year to empty if using a <select> and a placeholder', function () {
      this.scope.configuration.fields.expirationYear = {
        select: true,
        placeholder: 'expiration year placeholder'
      };
      expect(CreditCardForm.prototype.resetAttributes.call(this.scope).expirationYear).to.deep.equal(this.emptyProperty);
    });
  });

  describe('emitEvent', function () {
    it('sends the proper form data', function () {
      var fakeData = {
        possibleCardTypes: [],
        number: {
          value: '',
          isEmpty: true,
          isValid: false,
          isPotentiallyValid: true,
          isFocused: false
        },
        cvv: {
          value: '123',
          isEmpty: false,
          isValid: true,
          isPotentiallyValid: true,
          isFocused: false
        },
        expirationDate: {
          value: 'bad',
          isEmpty: false,
          isValid: false,
          isPotentiallyValid: false,
          isFocused: true
        }
      };

      CreditCardForm.prototype.emitEvent.call({
        get: function (property) { return fakeData[property]; },
        _fieldKeys: [
          'number',
          'cvv',
          'expirationDate'
        ]
      }, 'number', 'foo');

      expect(global.bus.emit).to.be.calledWith(events.INPUT_EVENT, this.sandbox.match({
        merchantPayload: {
          cards: [],
          emittedBy: 'number',
          fields: {
            number: {
              isEmpty: true,
              isValid: false,
              isPotentiallyValid: true,
              isFocused: false
            },
            cvv: {
              isEmpty: false,
              isValid: true,
              isPotentiallyValid: true,
              isFocused: false
            },
            expirationDate: {
              isEmpty: false,
              isValid: false,
              isPotentiallyValid: false,
              isFocused: true
            }
          }
        },
        type: 'foo'
      }));
    });

    it('sends an empty array if there are 0 possible card types', function () {
      CreditCardForm.prototype.emitEvent.call({
        get: function (property) {
          if (property === 'possibleCardTypes') { return []; }

          return {};
        },
        _fieldKeys: []
      }, 'number', 'foo');

      expect(global.bus.emit).to.be.calledWith(events.INPUT_EVENT, this.sandbox.match({
        merchantPayload: {
          cards: [],
          emittedBy: 'number',
          fields: {}
        },
        type: 'foo'
      }));
    });

    it('sends an array of possible cards if there are more than 1 possible card types', function () {
      var cards = [
        {
          niceType: 'Visa',
          type: 'visa',
          code: {
            size: 3,
            name: 'CVV'
          },
          gaps: [3, 7, 11],
          supported: true
        },
        {
          niceType: 'Discover',
          type: 'discover',
          code: {
            size: 3,
            name: 'CID'
          },
          gaps: [3, 7, 11],
          supported: true
        }
      ];

      CreditCardForm.prototype.emitEvent.call({
        get: function (property) {
          if (property === 'possibleCardTypes') { return cards; }

          return {};
        },
        _fieldKeys: []
      }, 'number', 'foo');

      expect(global.bus.emit).to.be.calledWith(events.INPUT_EVENT, this.sandbox.match({
        merchantPayload: {
          cards: cards.map(function (card) {
            return {
              niceType: card.niceType,
              type: card.type,
              code: card.code,
              supported: true
            };
          }),
          emittedBy: 'number',
          fields: {}
        },
        type: 'foo'
      }));
    });

    it('sends a card if there is 1 possible card type', function () {
      CreditCardForm.prototype.emitEvent.call({
        get: function (property) {
          if (property === 'possibleCardTypes') {
            return [{
              niceType: 'Visa',
              type: 'visa',
              code: {
                size: 3,
                name: 'CVV'
              },
              gaps: [3, 7, 11],
              supported: true
            }];
          }

          return {};
        },
        _fieldKeys: []
      }, 'number', 'foo');

      expect(global.bus.emit).to.be.calledWith(events.INPUT_EVENT, this.sandbox.match({
        merchantPayload: {
          cards: [{
            niceType: 'Visa',
            type: 'visa',
            code: {
              size: 3,
              name: 'CVV'
            },
            supported: true
          }],
          emittedBy: 'number',
          fields: {}
        },
        type: 'foo'
      }));
    });
  });

  describe('getCardData', function () {
    it('gets credit card number', function () {
      this.card.set('number.value', '4111111111111111');
      expect(this.card.getCardData().number).to.equal('4111111111111111');

      this.card.set('number.value', '');
      expect(this.card.getCardData().number).to.equal('');
    });

    it('skips credit card number if not in the config', function () {
      var card = new CreditCardForm(helpers.getModelConfig([
        'cvv',
        'expirationMonth',
        'expirationYear'
      ]));

      expect(card.getCardData().number).to.be.undefined;
      card.set('number.value', '4111111111111111');
      expect(card.getCardData().number).to.be.undefined;
      card.set('number.value', '');
      expect(card.getCardData().number).to.be.undefined;
    });

    it('skips CVV if not in the config', function () {
      var card = new CreditCardForm(helpers.getModelConfig([
        'number',
        'expirationMonth',
        'expirationYear'
      ]));

      expect(card.getCardData().cvv).to.be.undefined;
      card.set('cvv.value', '123');
      expect(card.getCardData().cvv).to.be.undefined;
      card.set('cvv.value', '');
      expect(card.getCardData().cvv).to.be.undefined;
    });

    it('gets CVV if specified in the config', function () {
      this.card.set('cvv.value', '123');
      expect(this.card.getCardData().cvv).to.equal('123');

      this.card.set('cvv.value', '');
      expect(this.card.getCardData().cvv).to.equal('');
    });

    it('can get expiration month and year from the expirationDate', function () {
      var cardData;

      this.card.set('expirationDate.value', '10' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('10');
      expect(cardData.expirationYear).to.equal(nextYear);

      this.card.set('expirationDate.value', '01' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('01');
      expect(cardData.expirationYear).to.equal(nextYear);

      this.card.set('expirationDate.value', '');
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('');
      expect(cardData.expirationYear).to.equal('');
    });

    it('ignores spaces, slashes, and hyphens in expirationDate', function () {
      var cardData;

      this.card.set('expirationDate.value', '1 - 0 / ' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('10');
      expect(cardData.expirationYear).to.equal(nextYear);

      this.card.set('expirationDate.value', '  ---  0/-///1 ' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('01');
      expect(cardData.expirationYear).to.equal(nextYear);

      this.card.set('expirationDate.value', '12 / ' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('12');
      expect(cardData.expirationYear).to.equal(nextYear);

      this.card.set('expirationDate.value', '2 - ' + nextYear);
      cardData = this.card.getCardData();
      expect(cardData.expirationMonth).to.equal('02');
      expect(cardData.expirationYear).to.equal(nextYear);
    });

    it('skips expiration if neither are in the config', function () {
      var card = new CreditCardForm(helpers.getModelConfig([
        'number'
      ]));

      expect(card.getCardData().expirationYear).to.be.undefined;
      card.set('expirationYear.value', '2020');
      expect(card.getCardData().expirationYear).to.be.undefined;
      card.set('expirationYear.value', '');
      expect(card.getCardData().expirationYear).to.be.undefined;

      expect(card.getCardData().expirationMonth).to.be.undefined;
      card.set('expirationMonth.value', '2020');
      expect(card.getCardData().expirationMonth).to.be.undefined;
      card.set('expirationMonth.value', '');
      expect(card.getCardData().expirationMonth).to.be.undefined;

      expect(card.getCardData().expirationDate).to.be.undefined;
      card.set('expirationDate.value', '2020');
      expect(card.getCardData().expirationDate).to.be.undefined;
      card.set('expirationDate.value', '');
      expect(card.getCardData().expirationDate).to.be.undefined;
    });

    it('can get expiration month and year if expirationDate is not specified', function () {
      var cardData;
      var card = new CreditCardForm(helpers.getModelConfig([
        'number',
        'cvv',
        'expirationMonth',
        'expirationYear'
      ]));

      card.set('expirationMonth.value', '10');
      card.set('expirationYear.value', nextYear);
      cardData = card.getCardData();
      expect(cardData.expirationMonth).to.equal('10');
      expect(cardData.expirationYear).to.equal(nextYear);

      card.set('expirationMonth.value', '');
      card.set('expirationYear.value', nextYear);
      cardData = card.getCardData();
      expect(cardData.expirationMonth).to.equal('');
      expect(cardData.expirationYear).to.equal(nextYear);

      card.set('expirationMonth.value', '02');
      card.set('expirationYear.value', '');
      cardData = card.getCardData();
      expect(cardData.expirationMonth).to.equal('02');
      expect(cardData.expirationYear).to.equal('');

      card.set('expirationMonth.value', '');
      card.set('expirationYear.value', '');
      cardData = card.getCardData();
      expect(cardData.expirationMonth).to.equal('');
      expect(cardData.expirationYear).to.equal('');

      card.set('expirationMonth.value', '13');
      card.set('expirationYear.value', '1920');
      cardData = card.getCardData();
      expect(cardData.expirationMonth).to.equal('13');
      expect(cardData.expirationYear).to.equal('1920');
    });

    it('gets postal code if present', function () {
      this.card.set('postalCode.value', '6061b');
      expect(this.card.getCardData().postalCode).to.equal('6061b');

      this.card.set('postalCode.value', '');
      expect(this.card.getCardData().postalCode).to.equal('');
    });

    it('skips postal code if not present in the configuration', function () {
      var card = new CreditCardForm(helpers.getModelConfig([
        'number',
        'cvv',
        'expirationMonth',
        'expirationYear'
      ]));

      expect(card.getCardData().postalCode).to.be.undefined;

      card.set('postalCode.value', '6061b');
      expect(card.getCardData().postalCode).to.be.undefined;

      card.set('postalCode.value', '');
      expect(card.getCardData().postalCode).to.be.undefined;
    });
  });

  describe('getCardTypes', function () {
    it('returns a list of card types', function () {
      var mastercardOrMaestroCard = '5';
      var expected = getCardTypes(mastercardOrMaestroCard);
      var actual = CreditCardForm.prototype.getCardTypes.call({}, mastercardOrMaestroCard);

      expect(actual).to.deep.equal(expected);
    });

    it('sets supported for supported card types', function () {
      var discoverOrMaestroCard = '60';
      var context = {
        supportedCardTypes: ['discover']
      };
      var cardTypes = CreditCardForm.prototype.getCardTypes.call(
        context,
        discoverOrMaestroCard
      );

      expect(cardTypes.length).to.equal(2);
      expect(cardTypes[0].niceType).to.equal('Discover');
      expect(cardTypes[0].type).to.equal('discover');
      expect(cardTypes[0].supported).to.equal(true);
      expect(cardTypes[1].niceType).to.equal('Maestro');
      expect(cardTypes[1].type).to.equal('maestro');
      expect(cardTypes[1].supported).to.equal(false);
    });
  });

  describe('isEmpty', function () {
    it('returns true when fields are empty', function () {
      expect(this.card.isEmpty()).to.equal(true);
    });

    it('returns true when fields are set to empty', function () {
      this.card.set('number.value', '');
      this.card.set('cvv.value', '');
      this.card.set('expirationDate.value', '');
      this.card.set('postalCode.value', '');

      expect(this.card.isEmpty()).to.equal(true);
    });

    it('returns false when fields are filled', function () {
      this.card.set('number.value', '4111111111111111');
      this.card.set('cvv.value', '123');
      this.card.set('expirationDate.value', '07' + nextYear);
      this.card.set('postalCode.value', '30303');

      expect(this.card.isEmpty()).to.equal(false);
    });

    it('returns false when some fields are empty', function () {
      this.card.set('number.value', '');
      this.card.set('cvv.value', '');
      this.card.set('expirationDate.value', '07' + nextYear);
      this.card.set('postalCode.value', '30303');

      expect(this.card.isEmpty()).to.equal(false);
    });
  });

  describe('invalidFieldKeys', function () {
    it('returns invalid keys when all fields are invalid', function () {
      this.card.set('number.value', 'not-a-card-number');
      this.card.set('cvv.value', 'not-a-cvv');
      this.card.set('expirationDate.value', '041789');
      this.card.set('postalCode.value', '');

      expect(this.card.invalidFieldKeys()).to.contain('number');
      expect(this.card.invalidFieldKeys()).to.contain('cvv');
      expect(this.card.invalidFieldKeys()).to.contain('expirationDate');
      expect(this.card.invalidFieldKeys()).to.contain('postalCode');
    });

    it('returns only invalid keys when some keys are invalid', function () {
      this.card.set('number.value', '4111111111111111');
      this.card.set('cvv.value', '123');
      this.card.set('expirationDate.value', '041789');
      this.card.set('postalCode.value', '');

      expect(this.card.invalidFieldKeys()).to.not.contain('number');
      expect(this.card.invalidFieldKeys()).to.not.contain('cvv');
      expect(this.card.invalidFieldKeys()).to.contain('expirationDate');
      expect(this.card.invalidFieldKeys()).to.contain('postalCode');
    });

    it('returns an empty array when all keys are valid', function () {
      this.card.set('number.value', '4111111111111111');
      this.card.set('cvv.value', '123');
      this.card.set('expirationDate.value', '07' + nextYear);
      this.card.set('postalCode.value', '30305');

      expect(this.card.invalidFieldKeys()).to.be.empty;
      expect(this.card.invalidFieldKeys()).to.be.instanceOf(Array);
    });

    it('marks postal code as invalid if set minlength is not reached', function () {
      this.card.set('postalCode.value', '303');

      expect(this.card.invalidFieldKeys()).to.not.contain('postalCode');

      this.card.configuration.fields.postalCode.minlength = 4;
      this.card.set('postalCode.value', '123');
      expect(this.card.invalidFieldKeys()).to.contain('postalCode');

      this.card.set('postalCode.value', '4321');
      expect(this.card.invalidFieldKeys()).to.not.contain('postalCode');
    });

    it('marks cvv as invalid if set minlength is not reached in cvv only integration', function () {
      var card = new CreditCardForm(helpers.getModelConfig([
        'cvv'
      ]));

      card.set('cvv.value', '123');

      expect(card.invalidFieldKeys()).to.not.contain('cvv');

      card.configuration.fields.cvv.minlength = 4;
      card.set('cvv.value', '321');
      expect(card.invalidFieldKeys()).to.contain('cvv');

      card.set('cvv.value', '1234');
      expect(card.invalidFieldKeys()).to.not.contain('cvv');
    });

    it('ignores cvv minlength in non-cvv only integration', function () {
      this.card.configuration.fields.cvv.minlength = 4;
      this.card.set('cvv.value', '123');

      expect(this.card.invalidFieldKeys()).to.not.contain('cvv');
    });
  });

  describe('possibleCardTypes', function () {
    it('changes credit card type when the number changes', function () {
      var assert = function () {
        var types = this.card.get('possibleCardTypes');
        var number = this.card.get('number').value;

        expect(types).to.deep.equal(getCardTypes(number));
      }.bind(this);

      assert();

      this.card.set('number.value', '4');
      assert();

      this.card.set('number.value', '411');
      assert();

      this.card.set('number.value', '4111111111111111');
      assert();

      this.card.set('number.value', '5555');
      assert();

      this.card.set('number.value', '5555555555554444');
      assert();

      this.card.set('number.value', '378');
      assert();

      this.card.set('number.value', '378282246310005');
      assert();

      this.card.set('number.value', '');
      assert();
    });

    it('validates CVV', function () {
      this.card.set('possibleCardTypes', [
        {code: {size: 3}},
        {code: {size: 4}}
      ]);

      expect(this.card.get('cvv.isValid')).to.equal(false);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);

      this.card.set('cvv.value', '123');

      expect(this.card.get('cvv.isValid')).to.equal(true);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);

      this.card.set('cvv.value', '1234');

      expect(this.card.get('cvv.isValid')).to.equal(true);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);

      this.card.set('cvv.value', '12345');

      expect(this.card.get('cvv.isValid')).to.equal(false);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(false);
    });

    it('revalidates CVV when possibleCardTypes changes', function () {
      expect(this.card.get('cvv.isValid')).to.equal(false);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);

      this.card.set('possibleCardTypes', [{code: {size: 3}}]);

      expect(this.card.get('cvv.isValid')).to.equal(false);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);

      this.card.set('cvv.value', '1234');

      expect(this.card.get('cvv.isValid')).to.equal(false);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(false);

      this.card.set('possibleCardTypes', [{code: {size: 4}}]);

      expect(this.card.get('cvv.isValid')).to.equal(true);
      expect(this.card.get('cvv.isPotentiallyValid')).to.equal(true);
    });

    it('emits a CARD_TYPE_CHANGE event', function () {
      var i;
      var callCount = 0;

      this.sandbox.stub(this.card, 'emitEvent');

      this.card.set('number.value', '4111111111111111');
      this.card.set('number.value', '');
      this.card.set('number.value', '378282246310005');

      expect(this.card.emitEvent).to.be.calledWith('number', externalEvents.CARD_TYPE_CHANGE);

      for (i = 0; i < this.card.emitEvent.callCount; i++) {
        if (this.card.emitEvent.getCall(i).args[1] === externalEvents.CARD_TYPE_CHANGE) {
          callCount++;
        }
      }
      expect(callCount).to.equal(3);
    });

    it('emits a VALIDITY_CHANGE event', function () {
      var i;
      var callCount = 0;

      this.sandbox.stub(this.card, 'emitEvent');

      this.card.set('number.value', '');
      this.card.set('number.value', '411111111111111');
      this.card.set('number.value', '4111111111111111');
      this.card.set('number.value', '411111111111111123');

      expect(this.card.emitEvent).to.be.calledWith('number', externalEvents.VALIDITY_CHANGE);

      for (i = 0; i < this.card.emitEvent.callCount; i++) {
        if (this.card.emitEvent.getCall(i).args[1] === externalEvents.VALIDITY_CHANGE) {
          callCount++;
        }
      }
      expect(callCount).to.equal(2);
    });

    context('supporting card types', function () {
      beforeEach(function () {
        var config = assign({}, helpers.getModelConfig(['number']), {
          supportedCardTypes: ['Discover']
        });

        this.supportedCardForm = new CreditCardForm(config);
      });

      it('sets supported property for all card types', function () {
        var possibleCardTypes = this.supportedCardForm.get('possibleCardTypes');

        possibleCardTypes.forEach(function (cardType) {
          if (cardType.type === 'discover') {
            expect(cardType.supported).to.be.true;
          } else {
            expect(cardType.supported).to.be.false;
          }
        });
      });

      it('sets number to potentially valid after removing an unsupported card number', function () {
        var visa = '41';
        var empty = '';

        this.supportedCardForm.set('number.value', visa);
        expect(this.supportedCardForm.get('number.value')).to.equal(visa);
        expect(this.supportedCardForm.get('number.isValid')).to.be.false;
        expect(this.supportedCardForm.get('number.isPotentiallyValid')).to.be.false;

        this.supportedCardForm.set('number.value', empty);
        expect(this.supportedCardForm.get('number.value')).to.equal(empty);
        expect(this.supportedCardForm.get('number.isValid')).to.be.false;
        expect(this.supportedCardForm.get('number.isPotentiallyValid')).to.be.true;
      });

      it('is not valid nor potentially valid when using a unsupported card type', function () {
        var mastercard = '5555555555554444';

        this.supportedCardForm.set('number.value', mastercard);
        expect(this.supportedCardForm.get('number.value')).to.equal(mastercard);
        expect(this.supportedCardForm.get('number.isValid')).to.be.false;
        expect(this.supportedCardForm.get('number.isPotentiallyValid')).to.be.false;
      });

      it('is valid and potentially valid when using a supported card type', function () {
        var discover = '6011000000000004';

        this.supportedCardForm.set('number.value', discover);
        expect(this.supportedCardForm.get('number.value')).to.equal(discover);
        expect(this.supportedCardForm.get('number.isValid')).to.be.true;
        expect(this.supportedCardForm.get('number.isPotentiallyValid')).to.be.true;
      });
    });

    context('luhn validity', function () {
      it('passes option to card validator', function () {
        var invalidCard = '6212345000000001';
        var config = assign({}, helpers.getModelConfig(['number']), {
          supportedCardTypes: ['UnionPay']
        });

        this.supportedCardForm = new CreditCardForm(config);
        this.sandbox.spy(validator, 'number');
        this.supportedCardForm.set('number.value', invalidCard);

        expect(validator.number).to.be.calledWith(invalidCard, {luhnValidateUnionPay: true});
      });
    });
  });

  describe('field empty change', function () {
    beforeEach(function () {
      this.sandbox.stub(this.card, 'emitEvent');
    });

    it('emits an EMPTY event', function () {
      this.card.set('number.value', '4');
      this.card.set('number.value', '');

      expect(this.card.emitEvent).to.be.calledWith('number', externalEvents.EMPTY);
    });

    it('emits a NOT_EMPTY event', function () {
      this.card.set('number.value', '4');

      expect(this.card.emitEvent).to.be.calledWith('number', externalEvents.NOT_EMPTY);
    });
  });

  describe('setSupportedCardTypes', function () {
    it('sets a supportedCardTypes property', function () {
      var configuration = helpers.getModelConfig();
      var cardForm = new CreditCardForm(configuration);

      expect(cardForm.supportedCardTypes).to.be.undefined;

      cardForm.setSupportedCardTypes(['VISA']);

      expect(cardForm.supportedCardTypes).to.deep.equal(['visa']);
    });

    it('normalizes supportedCardTypes', function () {
      var configuration = helpers.getModelConfig();
      var supportedCardTypes = [
        'discover',
        'Master-Card',
        'VISA'
      ];
      var cardForm = new CreditCardForm(configuration);

      cardForm.setSupportedCardTypes(supportedCardTypes);
      expect(cardForm.supportedCardTypes).to.be.deep.equal([
        'discover',
        'mastercard',
        'visa'
      ]);
    });
  });
});
