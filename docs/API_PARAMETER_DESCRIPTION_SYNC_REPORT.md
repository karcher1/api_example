# Отчет о синхронизации описаний API-параметров

Дата запуска: 2026-06-07T11:03:24.023Z

Источник: https://gateway.billerix.com/docs/api/buyers/enable-token

## Краткий итог

- Просканировано ссылок из API sidebar: 36
- Успешно прочитано страниц сайта: 36
- Страниц сайта, распознанных как API endpoints: 32
- Совпавших endpoints по `method + path`: 32
- Локальных endpoints без совпадения на сайте: 12
- Endpoints на сайте без локального совпадения: 0
- Совпавших параметров: 799
- Обновлено описаний параметров: 414
- Из них заменены placeholder-описания: 304
- Уже совпадали и не менялись: 328
- Пропущено параметров из-за проблем сопоставления: 7
- Повторных совпадений с тем же локальным параметром, не требующих отдельной записи: 50
- Параметров есть на сайте, но нет у нас: 137
- Параметров есть у нас, но нет на сайте: 86
- Режим dry-run: нет
- YAML пересобирался из git HEAD: да

## Что переносилось и что не переносилось

Переносились только поля `description` у параметров в `content/api/endpoints/*.yaml`.

Не переносились request/response code examples, response example bodies, webhook pages, SDK, Google Pay, guide pages, страницы test cards, общая страница ошибок и любые страницы без пары HTTP method + API path.

## Что пошло не так

- Страница `https://gateway.billerix.com/docs/api/checkout/one-time-payment` пропущена: Страница не выглядит как API endpoint: не найден корректный HTTP method и path.
- Страница `https://gateway.billerix.com/docs/api/endpoint-response-errors` пропущена: Страница не выглядит как API endpoint: не найден корректный HTTP method и path.
- Страница `https://gateway.billerix.com/docs/api/subscriptions/get-buyer-subscriptions` пропущена: Страница не выглядит как API endpoint: не найден корректный HTTP method и path.
- Страница `https://gateway.billerix.com/docs/api/test-cards` пропущена: Страница не выглядит как API endpoint: не найден корректный HTTP method и path.
- Endpoint `change-buyer-data` (PATCH /api/v2/buyers/{buyerId}): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `create-new-order-by-another-payment-method` (POST /api/v3/buyers/{buyerId}/another-payment-method): requestBodyParameters:products.actionName — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Type of action being passed. For this contract, pass purchase .", пропущено: "Type of action being passed. For this contract you can pass: renew upgrade downgrade .".; requestBodyParameters:products.productCode — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Product code of the item to be purchased", пропущено: "Product code for the action".
- Endpoint `disable-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/disable): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `disable-token` (PUT /api/v3/buyers/{buyerId}/disable-token): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `enable-token` (PUT /api/v3/buyers/{buyerId}/enable-token): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `freeze-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/freeze): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `get-bundle-product-prices-with-taxes` (POST /api/v3/buyers/{buyerId}/products/bundles): requestBodyParameters:bundles.products.actionName — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Specifies the action type. For this contract, send purchase .", пропущено: "Specifies the action type. For this contract you can pass: renew upgrade downgrade .".; responses:data.bundles.products.amount.amountForAction — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "The amount that must be paid to perform the action.  Note: For the PURCHASE action, this currently always comes as 0.00 .", пропущено: "The amount that must be paid to perform the action.  Note: For the RENEW action, this currently always comes as 0.00 .".; responses:data.bundles.products.amount.amountForAction — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "The amount that must be paid to perform the action.  Note: For the PURCHASE action, this currently always comes as 0.00 .", пропущено: "The amount that must be paid to perform the action.".
- Endpoint `oneclick-bundle-order-creation` (POST /api/v3/buyers/{buyerId}/oneclick): requestBodyParameters:products.actionName — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Type of action being passed. For this contract, pass purchase .", пропущено: "Type of action being passed. For this contract you can pass: renew upgrade downgrade .".; requestBodyParameters:products.productCode — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Product code of the item to be purchased", пропущено: "Product code for the action".
- Endpoint `set-token-for-subscription` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/set-token): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `suspend-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/suspend): На сайте есть блок Response parameters, но в нем нет таблицы параметров.
- Endpoint `unfreeze-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/unfreeze): На сайте есть блок Response parameters, но в нем нет таблицы параметров.

## Обновленные endpoints

- `change-subscription-s-autocharge-status` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_autocharge_status) — обновлено: 25, уже совпадало: 0, файл: `content/api/endpoints/change-subscription-s-autocharge-status.yaml`
- `change-subscription-s-expiration-date` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_expiration_date) — обновлено: 24, уже совпадало: 0, файл: `content/api/endpoints/change-subscription-s-expiration-date.yaml`
- `create-buyer` (POST /api/v2/buyers) — обновлено: 1, уже совпадало: 15, файл: `content/api/endpoints/create-buyer.yaml`
- `create-manual-subscription` (POST /api/v2/buyers/{buyerId}/subscriptions) — обновлено: 13, уже совпадало: 0, файл: `content/api/endpoints/create-manual-subscription.yaml`
- `create-new-order-by-another-payment-method` (POST /api/v3/buyers/{buyerId}/another-payment-method) — обновлено: 29, уже совпадало: 0, файл: `content/api/endpoints/create-new-order-by-another-payment-method.yaml`
- `create-order-v3` (POST /api/v3/initials/url) — обновлено: 3, уже совпадало: 28, файл: `content/api/endpoints/create-order-v3.yaml`
- `create-order` (POST /api/v2/initials/url) — обновлено: 3, уже совпадало: 26, файл: `content/api/endpoints/create-order.yaml`
- `disable-subscription-s-autocharge-status` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_disable) — обновлено: 25, уже совпадало: 0, файл: `content/api/endpoints/disable-subscription-s-autocharge-status.yaml`
- `disable-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/disable) — обновлено: 8, уже совпадало: 0, файл: `content/api/endpoints/disable-subscription.yaml`
- `enable-subscription-s-autocharge-status` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_enable) — обновлено: 25, уже совпадало: 0, файл: `content/api/endpoints/enable-subscription-s-autocharge-status.yaml`
- `freeze-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/freeze) — обновлено: 9, уже совпадало: 0, файл: `content/api/endpoints/freeze-subscription.yaml`
- `get-bundle-product-prices-with-taxes` (POST /api/v3/buyers/{buyerId}/products/bundles) — обновлено: 76, уже совпадало: 1, файл: `content/api/endpoints/get-bundle-product-prices-with-taxes.yaml`
- `get-buyers-tokens` (GET /api/v3/buyers/{buyerId}/tokens) — обновлено: 2, уже совпадало: 23, файл: `content/api/endpoints/get-buyers-tokens.yaml`
- `get-charge-history` (GET /api/v3/buyers/{buyerId}/charge/history) — обновлено: 19, уже совпадало: 75, файл: `content/api/endpoints/get-charge-history.yaml`
- `get-currency` (GET /api/v3/geoip/currency) — обновлено: 1, уже совпадало: 6, файл: `content/api/endpoints/get-currency.yaml`
- `get-geo-info` (GET /api/v3/geoip/info) — обновлено: 1, уже совпадало: 13, файл: `content/api/endpoints/get-geo-info.yaml`
- `get-initial-order-data` (GET /api/v3/orders/{orderId}/result) — обновлено: 22, уже совпадало: 0, файл: `content/api/endpoints/get-initial-order-data.yaml`
- `get-prices-for-offer-page` (POST /api/v3/products/shop-prices) — обновлено: 8, уже совпадало: 78, файл: `content/api/endpoints/get-prices-for-offer-page.yaml`
- `get-tax-type-by-country-code` (GET /api/v2/taxes/type) — обновлено: 6, уже совпадало: 0, файл: `content/api/endpoints/get-tax-type-by-country-code.yaml`
- `manual-downgrade-subscription-by-staff` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/downgrade) — обновлено: 23, уже совпадало: 0, файл: `content/api/endpoints/manual-downgrade-subscription-by-staff.yaml`
- `manual-renew-subscription` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/renew) — обновлено: 23, уже совпадало: 0, файл: `content/api/endpoints/manual-renew-subscription.yaml`
- `manual-upgrade-subscription-by-staff` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/upgrade) — обновлено: 23, уже совпадало: 0, файл: `content/api/endpoints/manual-upgrade-subscription-by-staff.yaml`
- `oneclick-bundle-order-creation` (POST /api/v3/buyers/{buyerId}/oneclick) — обновлено: 21, уже совпадало: 0, файл: `content/api/endpoints/oneclick-bundle-order-creation.yaml`
- `set-token-for-subscription` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/set-token) — обновлено: 8, уже совпадало: 0, файл: `content/api/endpoints/set-token-for-subscription.yaml`
- `suspend-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/suspend) — обновлено: 8, уже совпадало: 0, файл: `content/api/endpoints/suspend-subscription.yaml`
- `unfreeze-subscription` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/unfreeze) — обновлено: 8, уже совпадало: 0, файл: `content/api/endpoints/unfreeze-subscription.yaml`

## Локальные endpoints без совпадения на сайте

- `buyers-order-history` (GET /api/v2/buyers/{buyerId}/charge/history) — файл: `content/api/endpoints/buyers-order-history.yaml`
- `create-initial-charge` (POST /api/v3/initials/{orderId}/charges) — файл: `content/api/endpoints/create-initial-charge.yaml`
- `get-all-buyers-subscriptions` (GET /api/v2/buyers/{buyerId}/subscriptions) — файл: `content/api/endpoints/get-all-buyers-subscriptions.yaml`
- `get-buyers-buyer-id-subscriptions-subscription-id-downgrade` (GET /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/downgrade) — файл: `content/api/endpoints/get-buyers-buyer-id-subscriptions-subscription-id-downgrade.yaml`
- `get-buyers-buyer-id-subscriptions-subscription-id-manual-renew` (GET /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/manual_renew) — файл: `content/api/endpoints/get-buyers-buyer-id-subscriptions-subscription-id-manual-renew.yaml`
- `get-buyers-buyer-id-subscriptions-subscription-id-purchase` (GET /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/purchase) — файл: `content/api/endpoints/get-buyers-buyer-id-subscriptions-subscription-id-purchase.yaml`
- `get-order-result-polling-endpoint` (GET /api/v2/orders/{orderId}/result) — файл: `content/api/endpoints/get-order-result-polling-endpoint.yaml`
- `get-product-prices-for-purchase` (GET /api/v2/products/purchase) — файл: `content/api/endpoints/get-product-prices-for-purchase.yaml`
- `get-product-prices-for-subscription-upgrade` (GET /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/upgrade) — файл: `content/api/endpoints/get-product-prices-for-subscription-upgrade.yaml`
- `get-shop-prices-for-bundles` (POST /api/v3/products/shop-prices/bundles) — файл: `content/api/endpoints/get-shop-prices-for-bundles.yaml`
- `one-time-payment` (POST /api/v3/initials/one-time/url) — файл: `content/api/endpoints/one-time-payment.yaml`

## Endpoints на сайте без локального совпадения

- Нет.

## Параметры сайта, отсутствующие у нас

### change-subscription-s-autocharge-status (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_autocharge_status)
Файл: `content/api/endpoints/change-subscription-s-autocharge-status.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### change-subscription-s-expiration-date (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_expiration_date)
Файл: `content/api/endpoints/change-subscription-s-expiration-date.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### create-new-order-by-another-payment-method (POST /api/v3/buyers/{buyerId}/another-payment-method)
Файл: `content/api/endpoints/create-new-order-by-another-payment-method.yaml`
- `request:products.PURCHASE`
- `request:products.autochargeStatus`
- `request:products.RENEW, UPGRADE and DOWNGRADE`
- `request:products.autochargeStatus`
- `responses[2xx]:data.params.metaData.Attributes for metaData are dynamic`

### create-order-v3 (POST /api/v3/initials/url)
Файл: `content/api/endpoints/create-order-v3.yaml`
- `request:metaData.Attributes for metaData are dynamic`
- `request:products.autoChargeStatus`
- `responses[2xx]:data.params.metaData.Attributes for metaData are dynamic`

### create-order (POST /api/v2/initials/url)
Файл: `content/api/endpoints/create-order.yaml`
- `request:metaData.Attributes for metaData are dynamic`
- `responses[2xx]:data.params.metaData.Attributes for metaData are dynamic`

### disable-subscription-s-autocharge-status (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_disable)
Файл: `content/api/endpoints/disable-subscription-s-autocharge-status.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### enable-subscription-s-autocharge-status (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_enable)
Файл: `content/api/endpoints/enable-subscription-s-autocharge-status.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### get-bundle-product-prices-with-taxes (POST /api/v3/buyers/{buyerId}/products/bundles)
Файл: `content/api/endpoints/get-bundle-product-prices-with-taxes.yaml`
- `request:bundles.products.PURCHASE`
- `request:bundles.products.RENEW, UPGRADE, DOWNGRADE`
- `responses[2xx]:data.products.durationMonths`
- `responses[2xx]:data.products.isActive`
- `responses[2xx]:data.bundles.products.PURCHASE`
- `responses[2xx]:data.bundles.products.quantity`
- `responses[2xx]:data.bundles.products.dailyAmount`
- `responses[2xx]:data.bundles.products.dailyAmount.origin`
- `responses[2xx]:data.bundles.products.dailyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.dailyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.discount`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.dailyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.couponCode`
- `responses[2xx]:data.bundles.products.dailyAmount.coupon`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.dailyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.tax`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.weeklyAmount`
- `responses[2xx]:data.bundles.products.weeklyAmount.origin`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.weeklyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.discount`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.weeklyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.couponCode`
- `responses[2xx]:data.bundles.products.weeklyAmount.coupon`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.weeklyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.tax`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.monthlyAmount`
- `responses[2xx]:data.bundles.products.monthlyAmount.origin`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.monthlyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.discount`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.monthlyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.couponCode`
- `responses[2xx]:data.bundles.products.monthlyAmount.coupon`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.monthlyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.tax`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.RENEW`
- `responses[2xx]:data.bundles.products.quantity`
- `responses[2xx]:data.bundles.products.dailyAmount`
- `responses[2xx]:data.bundles.products.dailyAmount.origin`
- `responses[2xx]:data.bundles.products.dailyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.dailyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.discount`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.dailyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.couponCode`
- `responses[2xx]:data.bundles.products.dailyAmount.coupon`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.dailyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.dailyAmount.tax`
- `responses[2xx]:data.bundles.products.dailyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.weeklyAmount`
- `responses[2xx]:data.bundles.products.weeklyAmount.origin`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.weeklyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.discount`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.weeklyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.couponCode`
- `responses[2xx]:data.bundles.products.weeklyAmount.coupon`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.weeklyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.weeklyAmount.tax`
- `responses[2xx]:data.bundles.products.weeklyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.monthlyAmount`
- `responses[2xx]:data.bundles.products.monthlyAmount.origin`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountForAction`
- `responses[2xx]:data.bundles.products.monthlyAmount.discountPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.discount`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscount`
- `responses[2xx]:data.bundles.products.monthlyAmount.couponPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.couponCode`
- `responses[2xx]:data.bundles.products.monthlyAmount.coupon`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscountAndCoupon`
- `responses[2xx]:data.bundles.products.monthlyAmount.taxPercent`
- `responses[2xx]:data.bundles.products.monthlyAmount.tax`
- `responses[2xx]:data.bundles.products.monthlyAmount.amountWithDiscountAndCouponAndTax`
- `responses[2xx]:data.bundles.products.UPGRADE, DOWNGRADE`
- `responses[2xx]:data.bundles.products.quantity`

### get-charge-history (GET /api/v3/buyers/{buyerId}/charge/history)
Файл: `content/api/endpoints/get-charge-history.yaml`
- `responses[2xx]:data.charges.paymentMethod.data.type`
- `responses[2xx]:data.charges.paymentMethod.data.riskSegment`

### get-geo-info (GET /api/v3/geoip/info)
Файл: `content/api/endpoints/get-geo-info.yaml`
- `responses[2xx]:city.name`
- `responses[2xx]:subdivision.name`
- `responses[2xx]:subdivision.isoCode`
- `responses[2xx]:location.latitude`
- `responses[2xx]:location.longitude`
- `responses[2xx]:location.timezone`
- `responses[2xx]:location.postalCode`
- `responses[2xx]:continent.name`
- `responses[2xx]:continent.isoCode`

### get-initial-order-data (GET /api/v3/orders/{orderId}/result)
Файл: `content/api/endpoints/get-initial-order-data.yaml`
- `headerParameters:x-public-key`
- `headerParameters:x-buyer-ip`
- `headerParameters:x-date`
- `headerParameters:x-token`

### get-prices-for-offer-page (POST /api/v3/products/shop-prices)
Файл: `content/api/endpoints/get-prices-for-offer-page.yaml`
- `headerParameters:x-public-key`
- `headerParameters:x-buyer-ip`
- `headerParameters:x-date`
- `headerParameters:x-token`
- `responses[2xx]:data.products.currentDurationDays`

### manual-downgrade-subscription-by-staff (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/downgrade)
Файл: `content/api/endpoints/manual-downgrade-subscription-by-staff.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### manual-renew-subscription (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/renew)
Файл: `content/api/endpoints/manual-renew-subscription.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### manual-upgrade-subscription-by-staff (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/upgrade)
Файл: `content/api/endpoints/manual-upgrade-subscription-by-staff.yaml`
- `responses[2xx]:data.buyerId`
- `responses[2xx]:data.autoСhargeStatus`

### oneclick-bundle-order-creation (POST /api/v3/buyers/{buyerId}/oneclick)
Файл: `content/api/endpoints/oneclick-bundle-order-creation.yaml`
- `request:metaData.Attributes for metaData are dynamic`
- `request:products.PURCHASE`
- `request:products.autochargeStatus`
- `request:products.RENEW, UPGRADE and DOWNGRADE`
- `request:products.subscriptionId`


## Локальные параметры, отсутствующие на сайте

### change-buyer-data (PATCH /api/v2/buyers/{buyerId})
Файл: `content/api/endpoints/change-buyer-data.yaml`
- `headerParameters:x-id`

### change-subscription-s-autocharge-status (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_autocharge_status)
Файл: `content/api/endpoints/change-subscription-s-autocharge-status.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:comment`
- `responses[200]:data.autoChargeStatus`

### change-subscription-s-expiration-date (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_expiration_date)
Файл: `content/api/endpoints/change-subscription-s-expiration-date.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:reason`
- `responses[200]:data.autoChargeStatus`

### create-buyer (POST /api/v2/buyers)
Файл: `content/api/endpoints/create-buyer.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:buyerMeta.{key}`

### create-manual-subscription (POST /api/v2/buyers/{buyerId}/subscriptions)
Файл: `content/api/endpoints/create-manual-subscription.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:end`

### create-new-order-by-another-payment-method (POST /api/v3/buyers/{buyerId}/another-payment-method)
Файл: `content/api/endpoints/create-new-order-by-another-payment-method.yaml`
- `headerParameters:x-google-analytics-client-id`
- `requestBodyParameters:products.autoChargeStatus`

### create-order-v3 (POST /api/v3/initials/url)
Файл: `content/api/endpoints/create-order-v3.yaml`
- `headerParameters:x-google-analytics-client-id`
- `requestBodyParameters:subbrand`
- `requestBodyParameters:products.autochargeStatus`
- `requestBodyParameters:buyer.locale`

### create-order (POST /api/v2/initials/url)
Файл: `content/api/endpoints/create-order.yaml`
- `headerParameters:x-google-analytics-client-id`
- `requestBodyParameters:qa`
- `requestBodyParameters:qa.countryCode`
- `requestBodyParameters:coupon`
- `requestBodyParameters:subbrand`

### disable-subscription-s-autocharge-status (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_disable)
Файл: `content/api/endpoints/disable-subscription-s-autocharge-status.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:comment`
- `responses[200]:data.autoChargeStatus`

### disable-subscription (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/disable)
Файл: `content/api/endpoints/disable-subscription.yaml`
- `headerParameters:x-id`

### disable-token (PUT /api/v3/buyers/{buyerId}/disable-token)
Файл: `content/api/endpoints/disable-token.yaml`
- `headerParameters:x-id`

### enable-subscription-s-autocharge-status (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_enable)
Файл: `content/api/endpoints/enable-subscription-s-autocharge-status.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:comment`
- `responses[200]:data.autoChargeStatus`

### enable-token (PUT /api/v3/buyers/{buyerId}/enable-token)
Файл: `content/api/endpoints/enable-token.yaml`
- `headerParameters:x-id`

### freeze-subscription (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/freeze)
Файл: `content/api/endpoints/freeze-subscription.yaml`
- `headerParameters:x-id`

### get-bundle-product-prices-with-taxes (POST /api/v3/buyers/{buyerId}/products/bundles)
Файл: `content/api/endpoints/get-bundle-product-prices-with-taxes.yaml`
- `headerParameters:x-id`
- `responses[200]:data.products.durationMonth`
- `responses[200]:data.products.availableForPurchase`

### get-buyers-charge-methods (GET /api/v2/buyers/{buyerId}/charge-methods)
Файл: `content/api/endpoints/get-buyers-charge-methods.yaml`
- `headerParameters:x-id`
- `pathParameters:buyerId`
- `responses[200]:data.type`
- `responses[200]:data.value`

### get-buyers-tokens (GET /api/v3/buyers/{buyerId}/tokens)
Файл: `content/api/endpoints/get-buyers-tokens.yaml`
- `headerParameters:x-id`
- `pathParameters:buyerId`

### get-charge-history (GET /api/v3/buyers/{buyerId}/charge/history)
Файл: `content/api/endpoints/get-charge-history.yaml`
- `headerParameters:x-id`
- `queryParameters:offset`
- `responses[200]:data.orderUuid`
- `responses[200]:data.charges.paymentMethod.data.riskSegments.type`
- `responses[200]:data.charges.paymentMethod.data.riskSegments.riskSegment`
- `responses[200]:data.charges.paymentMethod.data.{key}`
- `responses[200]:data.products.orderUuid`

### get-currency (GET /api/v3/geoip/currency)
Файл: `content/api/endpoints/get-currency.yaml`
- `headerParameters:x-id`
- `queryParameters:merchant`

### get-geo-info (GET /api/v3/geoip/info)
Файл: `content/api/endpoints/get-geo-info.yaml`
- `headerParameters:x-id`
- `queryParameters:merchant`
- `responses[200]:name`
- `responses[200]:name`
- `responses[200]:isoCode`
- `responses[200]:latitude`
- `responses[200]:longitude`
- `responses[200]:timezone`
- `responses[200]:postalCode`
- `responses[200]:name`
- `responses[200]:isoCode`

### get-initial-order-data (GET /api/v3/orders/{orderId}/result)
Файл: `content/api/endpoints/get-initial-order-data.yaml`
- `headerParameters:x-id`
- `queryParameters:isForced`
- `responses[200]:data.orderUuid`

### get-prices-for-offer-page (POST /api/v3/products/shop-prices)
Файл: `content/api/endpoints/get-prices-for-offer-page.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:products.priceCalculationType.monthlyAmount`

### get-tax-type-by-country-code (GET /api/v2/taxes/type)
Файл: `content/api/endpoints/get-tax-type-by-country-code.yaml`
- `headerParameters:x-id`
- `queryParameters:countryIsoTwoCode`

### manual-downgrade-subscription-by-staff (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/downgrade)
Файл: `content/api/endpoints/manual-downgrade-subscription-by-staff.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:productId`
- `responses[200]:data.autoChargeStatus`

### manual-renew-subscription (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/renew)
Файл: `content/api/endpoints/manual-renew-subscription.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:productId`
- `responses[200]:data.autoChargeStatus`

### manual-upgrade-subscription-by-staff (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/upgrade)
Файл: `content/api/endpoints/manual-upgrade-subscription-by-staff.yaml`
- `headerParameters:x-id`
- `requestBodyParameters:productId`
- `responses[200]:data.autoChargeStatus`

### oneclick-bundle-order-creation (POST /api/v3/buyers/{buyerId}/oneclick)
Файл: `content/api/endpoints/oneclick-bundle-order-creation.yaml`
- `requestBodyParameters:products.autoChargeStatus`
- `requestBodyParameters:products.subcriptionId`

### search-buyer-by-email (GET /api/v2/buyers/email/{email})
Файл: `content/api/endpoints/search-buyer-by-email.yaml`
- `headerParameters:x-id`
- `pathParameters:email`

### search-by-bin (GET /api/v3/cardbin/{bin}/find)
Файл: `content/api/endpoints/search-by-bin.yaml`
- `headerParameters:x-id`
- `pathParameters:bin`

### set-token-for-subscription (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/set-token)
Файл: `content/api/endpoints/set-token-for-subscription.yaml`
- `headerParameters:x-id`

### suspend-subscription (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/suspend)
Файл: `content/api/endpoints/suspend-subscription.yaml`
- `headerParameters:x-id`

### unfreeze-subscription (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/unfreeze)
Файл: `content/api/endpoints/unfreeze-subscription.yaml`
- `headerParameters:x-id`


## Параметры, которые не были перенесены

### create-new-order-by-another-payment-method (POST /api/v3/buyers/{buyerId}/another-payment-method)
Файл: `content/api/endpoints/create-new-order-by-another-payment-method.yaml`
- `requestBodyParameters:products.actionName` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Type of action being passed. For this contract, pass purchase .", пропущено: "Type of action being passed. For this contract you can pass: renew upgrade downgrade .".
- `requestBodyParameters:products.productCode` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Product code of the item to be purchased", пропущено: "Product code for the action".

### get-bundle-product-prices-with-taxes (POST /api/v3/buyers/{buyerId}/products/bundles)
Файл: `content/api/endpoints/get-bundle-product-prices-with-taxes.yaml`
- `requestBodyParameters:bundles.products.actionName` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Specifies the action type. For this contract, send purchase .", пропущено: "Specifies the action type. For this contract you can pass: renew upgrade downgrade .".
- `responses:data.bundles.products.amount.amountForAction` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "The amount that must be paid to perform the action.  Note: For the PURCHASE action, this currently always comes as 0.00 .", пропущено: "The amount that must be paid to perform the action.  Note: For the RENEW action, this currently always comes as 0.00 .".
- `responses:data.bundles.products.amount.amountForAction` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "The amount that must be paid to perform the action.  Note: For the PURCHASE action, this currently always comes as 0.00 .", пропущено: "The amount that must be paid to perform the action.".

### oneclick-bundle-order-creation (POST /api/v3/buyers/{buyerId}/oneclick)
Файл: `content/api/endpoints/oneclick-bundle-order-creation.yaml`
- `requestBodyParameters:products.actionName` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Type of action being passed. For this contract, pass purchase .", пропущено: "Type of action being passed. For this contract you can pass: renew upgrade downgrade .".
- `requestBodyParameters:products.productCode` — Один локальный параметр совпал с несколькими разными описаниями сайта. Уже выбрано: "Product code of the item to be purchased", пропущено: "Product code for the action".


## Совпавшие endpoints

- `change-buyer-data` ⇄ `Change buyer data` (PATCH /api/v2/buyers/{buyerId}) — https://gateway.billerix.com/docs/api/buyers/change-buyer-data
- `change-subscription-s-autocharge-status` ⇄ `Change autocharge status` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_autocharge_status) — https://gateway.billerix.com/docs/api/subscriptions/change-autocharge-status
- `change-subscription-s-expiration-date` ⇄ `Change subscription expire date` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/change_expiration_date) — https://gateway.billerix.com/docs/api/subscriptions/change-subscription-expire-date
- `create-buyer` ⇄ `Create buyer` (POST /api/v2/buyers) — https://gateway.billerix.com/docs/api/buyers/create-buyer
- `create-manual-subscription` ⇄ `Create subscription` (POST /api/v2/buyers/{buyerId}/subscriptions) — https://gateway.billerix.com/docs/api/subscriptions/create-subscription
- `create-new-order-by-another-payment-method` ⇄ `Another payment method` (POST /api/v3/buyers/{buyerId}/another-payment-method) — https://gateway.billerix.com/docs/api/bundles/another-payment-method
- `create-order-v3` ⇄ `Create initial order` (POST /api/v3/initials/url) — https://gateway.billerix.com/docs/api/checkout/create-order-v3
- `create-order` ⇄ `Create order` (POST /api/v2/initials/url) — https://gateway.billerix.com/docs/api/checkout/create-order
- `disable-subscription-s-autocharge-status` ⇄ `Disable autocharge for subscription` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_disable) — https://gateway.billerix.com/docs/api/subscriptions/disable-autocharge
- `disable-subscription` ⇄ `Subscription disable` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/disable) — https://gateway.billerix.com/docs/api/subscriptions/subscription-disable
- `disable-token` ⇄ `Disable token` (PUT /api/v3/buyers/{buyerId}/disable-token) — https://gateway.billerix.com/docs/api/buyers/disable-token
- `enable-subscription-s-autocharge-status` ⇄ `Enable autocharge for subscription` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/autocharge_enable) — https://gateway.billerix.com/docs/api/subscriptions/enable-autocharge
- `enable-token` ⇄ `Enable token` (PUT /api/v3/buyers/{buyerId}/enable-token) — https://gateway.billerix.com/docs/api/buyers/enable-token
- `freeze-subscription` ⇄ `Subscription freeze` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/freeze) — https://gateway.billerix.com/docs/api/subscriptions/subscription-freeze
- `get-bundle-product-prices-with-taxes` ⇄ `Get prices for oneclick` (POST /api/v3/buyers/{buyerId}/products/bundles) — https://gateway.billerix.com/docs/api/bundles/get-prices-for-oneclick
- `get-buyers-charge-methods` ⇄ `Get buyer's charge methods` (GET /api/v2/buyers/{buyerId}/charge-methods) — https://gateway.billerix.com/docs/api/buyers/get-buyers-charge-methods
- `get-buyers-tokens` ⇄ `Get buyer's tokens` (GET /api/v3/buyers/{buyerId}/tokens) — https://gateway.billerix.com/docs/api/buyers/get-buyers-tokens
- `get-charge-history` ⇄ `Get charge history` (GET /api/v3/buyers/{buyerId}/charge/history) — https://gateway.billerix.com/docs/api/buyers/get-charge-history
- `get-currency` ⇄ `Get currency by location` (GET /api/v3/geoip/currency) — https://gateway.billerix.com/docs/api/extra-info/get-currency
- `get-geo-info` ⇄ `Get buyer's info by IP` (GET /api/v3/geoip/info) — https://gateway.billerix.com/docs/api/extra-info/get-geo-info
- `get-initial-order-data` ⇄ `Get initial order data` (GET /api/v3/orders/{orderId}/result) — https://gateway.billerix.com/docs/api/order-status/get-order-status
- `get-prices-for-offer-page` ⇄ `Get prices for Offer page` (POST /api/v3/products/shop-prices) — https://gateway.billerix.com/docs/api/products/get-prices-for-offer-page
- `get-tax-type-by-country-code` ⇄ `Get tax type` (GET /api/v2/taxes/type) — https://gateway.billerix.com/docs/api/taxes/get-tax-type
- `manual-downgrade-subscription-by-staff` ⇄ `Subscription downgrade` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/downgrade) — https://gateway.billerix.com/docs/api/subscriptions/subscription-downgrade
- `manual-renew-subscription` ⇄ `Subscription renew` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/renew) — https://gateway.billerix.com/docs/api/subscriptions/subscription-renew
- `manual-upgrade-subscription-by-staff` ⇄ `Subscription upgrade` (POST /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/upgrade) — https://gateway.billerix.com/docs/api/subscriptions/subscription-upgrade
- `oneclick-bundle-order-creation` ⇄ `Create oneclick order` (POST /api/v3/buyers/{buyerId}/oneclick) — https://gateway.billerix.com/docs/api/bundles/create-oneclick-order
- `search-buyer-by-email` ⇄ `Search buyer by email` (GET /api/v2/buyers/email/{email}) — https://gateway.billerix.com/docs/api/buyers/search-buyer-by-email
- `search-by-bin` ⇄ `Search by BIN` (GET /api/v3/cardbin/{bin}/find) — https://gateway.billerix.com/docs/api/extra-info/search-by-bin
- `set-token-for-subscription` ⇄ `Set token for subscription` (PUT /api/v3/buyers/{buyerId}/subscriptions/{subscriptionId}/set-token) — https://gateway.billerix.com/docs/api/subscriptions/set-token
- `suspend-subscription` ⇄ `Subscription suspend` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/suspend) — https://gateway.billerix.com/docs/api/subscriptions/subscription-suspend
- `unfreeze-subscription` ⇄ `Subscription unfreeze` (PUT /api/v2/buyers/{buyerId}/subscriptions/{subscriptionId}/unfreeze) — https://gateway.billerix.com/docs/api/subscriptions/subscription-unfreeze
