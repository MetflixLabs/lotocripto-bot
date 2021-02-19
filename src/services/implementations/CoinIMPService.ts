import puppeteer from 'puppeteer'

import { coinimpApi } from '../../apis/coinimpApi'
import { CoinimpEndpointEnum } from '../../enums/CoinimpEndpointEnum'
import { ICoinIMPBalance } from '../../interfaces/ICoinIMPBalance'
import { ICoinIMPPayout } from '../../interfaces/ICoinIMPPayout'
import { ICoinIMPService } from '../ICoinIMPService'

export class CoinIMPService implements ICoinIMPService {
  async getBalance(): Promise<ICoinIMPBalance> {
    try {
      const axiosRes = await coinimpApi.get(CoinimpEndpointEnum.BALANCE)

      return axiosRes?.data
    } catch (error) {
      throw new Error(error.response.data)
    }
  }

  async payout(winnerWallet: string, amount: string): Promise<ICoinIMPPayout> {
    console.log(`[Payout] Starting a payout of ${amount} MINTME to wallet ${winnerWallet}`)
    try {
      if (!process.env.COINIMP_COOKIE) {
        throw new Error('COINIMP_COOKIE não informado.')
      }

      if (!winnerWallet) {
        throw new Error('Wallet não informada.')
      }

      const cookies = [
        {
          name: 'REMEMBERME',
          value: process.env.COINIMP_COOKIE,
          domain: 'www.coinimp.com',
        },
      ]

      const browser = await puppeteer.launch({
        // headless: false, // launch a browser
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // - to execute chrome instead of chromium
      })

      /**
       * Set cookies and navigate
       */
      const page = await browser.newPage()
      await page.setCookie(...cookies)
      await page.goto('https://www.coinimp.com/wallet')

      /**
       * Update wallet address to winner wallet
       */
      console.log(`[Payout] Updating wallet to be ${winnerWallet}`)

      const walletInput = await page.$('#edit_wallet_walletAddress')
      if (walletInput) {
        await walletInput.click({ clickCount: 3 })
        await walletInput.type(winnerWallet)
      }

      const walletAlertError = await page.$('#wallet-address-error')
      if (walletAlertError) {
        console.log(`[Payout] Invalid wallet, will grab another winner`)

        await browser.close()

        return {
          message: 'Carteira inválida informada',
          status: 'error',
        }
      }

      const saveWalletButton = await page.$('#edit_wallet_save')
      if (saveWalletButton) {
        await saveWalletButton.click()
      }

      await page.waitForNavigation()

      const walletAlertSuccess = await page.$('.alert-success')
      const walletAlertText = await page.evaluate(el => el.textContent, walletAlertSuccess)

      if (!walletAlertText.match(/Wallet address was saved successfully/gi)) {
        console.log(`[Payout] Invalid wallet, will grab another winner`)

        await browser.close()

        return {
          message: 'Carteira inválida informada',
          status: 'error',
        }
      }

      console.log(`[Payout] Wallet Updated`)
      console.log(`[Payout] Start payment`)

      /**
       * Init payment
       */

      const payButton = await page.$('#pay-button')
      if (payButton) {
        await payButton.click()
      }

      const amountInput = await page.$('input[name="quantity"]')
      if (amountInput) {
        await amountInput.click({ clickCount: 3 })
        await amountInput.type(amount.toString().replace(/\./gi, ','))
      }

      const insufficientFundsError = await page.$('form .text-danger')
      const insufficientFundsErrorText = await page.evaluate(
        el => el.textContent,
        insufficientFundsError
      )
      if (insufficientFundsErrorText) {
        console.log(`[Payout] WARNING: Insufficient funds to execute payout`)

        await browser.close()

        return {
          message: 'Fundos insuficentes para efetuar o pagamento',
          status: 'error',
        }
      }

      const confirmPaymentButton = await page.$('#confirm-pay-btn')
      if (confirmPaymentButton) {
        await confirmPaymentButton.click()
      }

      await page.waitForNavigation()

      /**
       * Confirm the payment
       */

      const paymentAlertSuccess = await page.$('.alert-success')
      const paymentAlertText = await page.evaluate(el => el.textContent, paymentAlertSuccess)

      if (!paymentAlertText.match(/Payout has been successfully issued/gi)) {
        console.log(
          `[Payout] Error on payment (success notification not found), will grab another winner`
        )

        await browser.close()

        return {
          message: 'Erro ao efetuar o pagamento',
          status: 'error',
        }
      }

      const lastPaymentStatus = await page.$(
        '#payment-history > div tbody > tr:last-of-type > td:nth-of-type(4)'
      )
      const lastPaymentStatusText = await page.evaluate(el => el.textContent, lastPaymentStatus)

      if (lastPaymentStatusText === 'Error') {
        console.log(
          `[Payout] Error on payment (last transaction status is Error), will grab another winner`
        )

        await browser.close()

        return {
          message: 'Erro ao efetuar o pagamento',
          status: 'error',
        }
      }

      console.log('[Payout] Payout successfull, waiting for blockchain receipt')

      /**
       * Payment successfull, send back data
       */
      const blockchainReceipt = await page.$(
        '#payment-history > div tbody > tr:last-of-type > td:nth-of-type(5) a'
      )
      const blockchainReceiptText = await page.evaluate(el => el.textContent, blockchainReceipt)

      const totalAmount = await page.$(
        '#payment-history > div tbody > tr:last-of-type > td:nth-of-type(2)'
      )
      const totalAmountValue = await page.evaluate(el => el.textContent, totalAmount)

      const feeAmount = await page.$(
        '#payment-history > div tbody > tr:last-of-type > td:nth-of-type(3)'
      )
      const feeAmountValue = await page.evaluate(el => el.textContent, feeAmount)

      const paidAmount = parseFloat(totalAmountValue) - parseFloat(feeAmountValue)

      console.log(`[Payout] Blockchain receipt: ${blockchainReceiptText}`)
      console.log('[Payout] Finish automation and return data')

      await browser.close()

      return {
        message: 'Pagamento efetuado com sucesso',
        paidAmount,
        blockchainReceipt: blockchainReceiptText,
        status: 'success',
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
