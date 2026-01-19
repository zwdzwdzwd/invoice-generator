// 初始默认数据
export const initialData = {
  // 收款方 (Me)
  payees: [
    {
      id: 'payee_wd',
      alias: 'WD',
      name: 'Clickbook Media Co., Limited',
      address_line1: 'UNIT D52, 3/F., WONG KING INDUSTRIAL BUILDING',
      address_line2: 'NO.2 TAI YAU STREET, KOWLOON HONG KONG',
      zip: '999077',
      email: 'wade@clickbookmedia.com'
    },
    {
      id: 'payee_ad',
      alias: 'AD',
      name: 'Clickbook Media Co., Limited',
      address_line1: 'UNIT D52, 3/F., WONG KING INDUSTRIAL BUILDING',
      address_line2: 'NO.2 TAI YAU STREET, KOWLOON HONG KONG',
      zip: '999077',
      email: 'wade@clickbookmedia.com'
    }
  ],
  // 银行账户 (Wire)
  wireAccounts: [
    {
      id: 'wire_wd_sc',
      alias: 'WD',
      label: 'Standard Chartered (HK)',
      accountName: 'Clickbook Media Co., Limited',
      accountNumber: '47417789499',
      bankCode: '003',
      branchCode: '474',
      swiftCode: 'SCBLHKHH',
      region: 'Hong Kong SAR',
      bankName: 'Standard Chartered Bank (Hong Kong) Ltd',
      bankAddress: '32nd Floor, 4-4A Des Voeux Road, Central, Hong Kong SAR 999077'
    }
  ],
  // Crypto账户
  cryptoAccounts: [
    {
      id: 'crypto_ad_trc20',
      alias: 'AD',
      label: 'USDT TRC20',
      network: 'TRC20',
      currency: 'USDT',
      address: 'TEAe4g5YPrAEthnAqjBpXo7jF9ysLMiH4e'
    }
  ],
  // 付款方 (Clients)
  clients: [
    {
      id: 'client_360',
      alias: '360',
      name: 'Alinthiya Korlátolt Felelősségű Társaság',
      regNumber: '01-09-434274',
      address: '1132 Budapest, Váci út 16. Fsz. 12th door',
      vat: 'HU32628234',
      director: 'Viktor Szabados',
      website: 'https://alinthiya.com/'
    },
    {
      id: 'client_mee',
      alias: 'Mee',
      name: 'Lead Bridge Limited',
      regNumber: '7764601',
      address: '14/F China Hong Kong Tower, 8 Hennessy Road, Wan Chai, Hong Kong',
      vat: '',
      director: '',
      website: ''
    }
  ]
};