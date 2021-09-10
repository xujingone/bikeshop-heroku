var express = require('express');
const Stripe = require('stripe');

var router = express.Router();
const stripe = Stripe('sk_test_51JY5SPCNgN3Ukf5g9HPX8ufMrSs2zym56zSjKWnPgY4mwQiNNCQpIInfRffAEyRoBdf7j2K6fjvQ2iB0knbdko7C00a6id15sJ');

var dataBike = [
  {
    name: 'BIKO45',
    imageURL: '/images/bike-1.jpg',
    price: 679
  },
  {
    name: 'ZOOK7',
    imageURL: '/images/bike-2.jpg',
    price: 779
  },
  {
    name: 'LIKO89',
    imageURL: '/images/bike-3.jpg',
    price: 839
  },
  {
    name: 'GEWO8',
    imageURL: '/images/bike-4.jpg',
    price: 1249
  },
  {
    name: 'KIWIT',
    imageURL: '/images/bike-5.jpg',
    price: 899
  },
  {
    name: 'NASAY',
    imageURL: '/images/bike-6.jpg',
    price: 1399
  },
  {
    name: 'NEWADD',
    imageURL: '/images/bike-1.jpg',
    price: 3000
  }
];
/* GET main page. */
router.get('/', function (req, res, next) {
  res.render('index', { dataBike });
});

/* GET shop page. */
router.get('/shop', function (req, res, next) {
  let dataCardBike = req.session.dataCardBike ?? [];
  const name = req.query.name;
  if (!name) {
    res.render('shop', { dataCardBike });
    return;
  }
  let item = dataCardBike.find(item => item.name === name);
  if (item) {
    /* update quantity. */
    item.quantity++;
  } else {
    /* add into dataCardBike. */
    let item = dataBike.find(item => item.name === name);
    dataCardBike.push({ ...item, quantity: 1 })
  }
  req.session.dataCardBike = dataCardBike
  res.render('shop', { dataCardBike });
});

/* Delete item from Panier */
router.get('/delete-shop', function (req, res, next) {
  let dataCardBike = req.session.dataCardBike;
  dataCardBike.splice(req.query.index, 1);
  res.render('shop', { dataCardBike })
});

/* Update bike quantity */
router.post('/update-shop', function (req, res, next) {
  let dataCardBike = req.session.dataCardBike;
  if (req.body.quantity) {
    dataCardBike[req.body.index].quantity = parseInt(req.body.quantity, 10);
  }

  res.render('shop', { dataCardBike })
});

router.get('/success', (req, res) => {
  req.session.dataCardBike = [];
  res.render('success');
});


router.post('/create-checkout-session', async (req, res) => {
  const panier = req.session.dataCardBike;
  const line_items = panier.map((item) => {
    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: `${req.headers.origin}/success`,
    cancel_url: `${req.headers.origin}/`,
  });

  res.redirect(303, session.url);
});

module.exports = router;
