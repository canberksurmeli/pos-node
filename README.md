
# Pos Node

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) 

![npm](https://img.shields.io/npm/v/pos-node?style=plastic)


The POS NODE is a lightweight and easy-to-use Nodejs library that provides payment operations using the Iyzico, NestPay (and I hope more) infrastructure. It is designed to simplify transactions between 3rd party payment infrastructure and your project. With pos-node, developers can quickly perform payment operations.

This library offers a simple and intuitive API, making it accessible for developers of all skill levels. It aims to provide a seamless integration into existing Node.js projects.

Important Node
This project is still UNDER DEVELOPMENT. It is not recommended to use production environments!!. for contributing please see the section below. 
## Features

Iyzico
- Payment and Payment with 3D
- Store the payment informations
- Store payment informations during payment
- Delete payment informations
- List stored payment informations.

Nestpay
- Payment and Payment with 3D

## Usage/Examples

```ts
import {
    PaymentFactory,
    Provider
} from "pos-node";


const paymentProvider = PaymentFactory.createPaymentMethod(Provider.Iyzico);
paymentProvider.setOptions({
	apiKey: "YOUR_API_KEY";
	secretKey: "YOUR_SECRET_KEY";
});

const response = await provider.purchase({
		locale: "tr", //localization @DEFAULT "en"
		conversationId: "123456", //uniqueId response request will contain.
		price: "12.5", //price before cuts
		paidPrice: params.price, //final price that user will pay
		installment: 1, //number of installment @DEFAULT 1
		paymentChannel: PaymentChannel.MOBILE, //@see PaymentChannel
		paymentGroup: PaymentGroup.PRODUCT, //@see PaymentGroup
		paymentCard: {
			cardHolderName: "Joe Brown",
			cardNumber: "1234 1234 1234 1234",
			expireYear: "25",
			expireMonth: "06",
			cvc: "123",
		}, 
		buyer: {
			id: "1", //buyer user id
			name: "Joe,
			surname: "Brown",
			identityNumber: "12345678900",
			email: "joe.brown@example.com",
			registrationDate: "2013-04-21 15:12:09",
			lastLoginDate: "2015-10-05 12:43:35",
			registrationAddress: "neighbourhood, Street, No:1",
			city: "City",
			country: "Country",
			ip: "192.168.1.1",
		},
		shippingAddress: {
			address: "neighbourhood, Street, No:1",
			contactName: "Joe Brown",
			city: "City",
			country: "Country",
		},
		billingAddress: {
			address: "neighbourhood, Street, No:1",
			contactName: "Joe Brown",
			city: "City",
			country: "Country",
		},
		basketItems: [
			{
				id: "123", //assetId
				price: "12.5", //asset price
				name: "product name", //product name
				category1: "Category", 
				itemType: BasketItemType.VIRTUAL, // @see BasketItemType 
				subMerchantKey: "sub_123", //sub merchant key if any
				subMerchantPrice: "5.2", //sub merchant share
			},
		],
		currency: "TRY", @DEFAULT "TRY"
	})

    if(response.status === "success"){
        /Payment process completed successfully
    }


```


## Contributing

Contributions are always welcome!

Please adhere to this project's `code of conduct`.

How to Contribute

Contributions to this project are welcome! If you would like to contribute, please follow these steps:

    Fork the repository on GitHub.

    Create a new branch from the main branch to work on your changes.

    Make your desired changes and additions to the codebase.

    Write unit tests to ensure the correctness of your changes.

    Commit your changes and push them to your forked repository.

    Submit a pull request to the original repository, describing your changes in detail.

    Wait for the maintainers to review your pull request and address any feedback.

If you have any question feel free to contact via canberk8@gmail.com. Thank you for your contributions!
