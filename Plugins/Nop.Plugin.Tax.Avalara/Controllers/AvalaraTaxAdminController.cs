﻿using Nop.Core;
using Nop.Core.Domain.Common;
using Nop.Core.Domain.Directory;
using Nop.Plugin.Tax.Avalara.Models.Configuration;
using Nop.Plugin.Tax.Avalara.Models.Log;
using Nop.Plugin.Tax.Avalara.Services;
using Nop.Services.Configuration;
using Nop.Services.Directory;
using Nop.Services.Localization;
using Nop.Services.Security;
using Nop.Services.Tax;
using Nop.Web.Framework.Controllers;
using Nop.Web.Framework.Security;
using System;
using System.Linq;
using System.Web.Mvc;
using Nop.Admin.Controllers;
using Nop.Admin.Models.Common;
using Nop.Web.Framework.Kendoui;

namespace Nop.Plugin.Tax.Avalara.Controllers
{
    [AdminAuthorize]
    [AdminAntiForgery]
    [AdminValidateIpAddress]
    [NopHttpsRequirement(SslRequirement.Yes)]
    public class AvalaraTaxAdminController : BaseAdminController
    {
        #region Fields

        private readonly AvalaraTaxManager _avalaraTaxManager;
        private readonly AvalaraTaxSettings _avalaraTaxSettings;
        private readonly CurrencySettings _currencySettings;
        private readonly ICountryService _countryService;
        private readonly ICurrencyService _currencyService;
        private readonly ILocalizationService _localizationService;
        private readonly IPermissionService _permissionService;
        private readonly ISettingService _settingService;
        private readonly IStateProvinceService _stateProvinceService;
        private readonly ITaxService _taxService;
        private readonly IWorkContext _workContext;

        #endregion

        #region Ctor

        public AvalaraTaxAdminController(AvalaraTaxManager avalaraTaxManager,
            AvalaraTaxSettings avalaraTaxSettings,
            CurrencySettings currencySettings,
            ICountryService countryService,
            ICurrencyService currencyService,
            ILocalizationService localizationService,
            IPermissionService permissionService,
            ISettingService settingService,
            IStateProvinceService stateProvinceService,
            ITaxService taxService,
            IWorkContext workContext)
        {
            this._avalaraTaxManager = avalaraTaxManager;
            this._avalaraTaxSettings = avalaraTaxSettings;
            this._currencySettings = currencySettings;
            this._countryService = countryService;
            this._currencyService = currencyService;
            this._localizationService = localizationService;
            this._permissionService = permissionService;
            this._settingService = settingService;
            this._stateProvinceService = stateProvinceService;
            this._taxService = taxService;
            this._workContext = workContext;
        }

        #endregion

        #region Utilities

        /// <summary>
        /// Check that plugin is configured
        /// </summary>
        /// <returns>True if it's configured; otherwise false</returns>
        private bool IsConfigured()
        {
            return !string.IsNullOrEmpty(_avalaraTaxSettings.AccountId)
                && !string.IsNullOrEmpty(_avalaraTaxSettings.LicenseKey);
        }

        /// <summary>
        /// Prepare address model
        /// </summary>
        /// <param name="model">Address model</param>
        private void PrepareAddress(AddressModel model)
        {
            //populate list of countries
            model.AvailableCountries = _countryService.GetAllCountries(showHidden: true)
                .Select(x => new SelectListItem { Text = x.Name, Value = x.Id.ToString() }).ToList();
            model.AvailableCountries.Insert(0, new SelectListItem { Text = _localizationService.GetResource("Admin.Address.SelectCountry"), Value = "0" });

            //populate list of states and provinces
            if (model.CountryId.HasValue && model.CountryId.Value > 0)
                model.AvailableStates = _stateProvinceService.GetStateProvincesByCountryId(model.CountryId.Value, showHidden: true)
                    .Select(x => new SelectListItem { Text = x.Name, Value = x.Id.ToString() }).ToList();
            if (!model.AvailableStates.Any())
                model.AvailableStates.Insert(0, new SelectListItem { Text = _localizationService.GetResource("Admin.Address.OtherNonUS"), Value = "0" });
        }

        #endregion

        #region Methods

        public ActionResult Configure()
        {
            if (!_permissionService.Authorize(StandardPermissionProvider.ManageTaxSettings))
                return AccessDeniedView();

            //prepare common properties
            var model = new ConfigurationModel
            {
                IsConfigured = IsConfigured(),
                AccountId = _avalaraTaxSettings.AccountId,
                LicenseKey = _avalaraTaxSettings.LicenseKey,
                CompanyCode = _avalaraTaxSettings.CompanyCode,
                UseSandbox = _avalaraTaxSettings.UseSandbox,
                CommitTransactions = _avalaraTaxSettings.CommitTransactions,
                ValidateAddress = _avalaraTaxSettings.ValidateAddress
            };

            //prepare address model
            PrepareAddress(model.TestAddress);

            //get account company list (only active)
            var activeCompanies = _avalaraTaxManager.GetAccountCompanies(true);
            if (activeCompanies?.Any() ?? false)
            {
                model.Companies = activeCompanies.OrderBy(company => company.isDefault ?? false ? 0 : 1).Select(company => new SelectListItem
                {
                    Text = company.isTest ?? false ? $"{company.name} (Test)" : company.name,
                    Value = company.companyCode
                }).ToList();
            }

            var defaultCompanyCode = _avalaraTaxSettings.CompanyCode;
            if (!model.Companies.Any())
            {
                //add the special item for 'there are no companies' with empty guid value
                var noCompaniesText = _localizationService.GetResource("Plugins.Tax.Avalara.Fields.Company.NotExist");
                model.Companies.Add(new SelectListItem { Text = noCompaniesText, Value = Guid.Empty.ToString() });
                defaultCompanyCode = Guid.Empty.ToString();
            }
            else if (string.IsNullOrEmpty(_avalaraTaxSettings.CompanyCode) || _avalaraTaxSettings.CompanyCode.Equals(Guid.Empty.ToString()))
                defaultCompanyCode = model.Companies.FirstOrDefault()?.Value;

            //set the default company
            model.CompanyCode = defaultCompanyCode;
            _avalaraTaxSettings.CompanyCode = defaultCompanyCode;
            _settingService.SaveSetting(_avalaraTaxSettings);

            //display warning in case of company currency differ from the primary store currency
            var primaryCurrency = _currencyService.GetCurrencyById(_currencySettings.PrimaryStoreCurrencyId);
            var selectedCompany = activeCompanies?.FirstOrDefault(company => company.companyCode.Equals(defaultCompanyCode));

            return View("~/Plugins/Tax.Avalara/Views/Configuration/Configure.cshtml", model);
        }

        [HttpPost, ActionName("Configure")]
        [FormValueRequired("save")]
        public ActionResult Configure(ConfigurationModel model)
        {
            if (!_permissionService.Authorize(StandardPermissionProvider.ManageTaxSettings))
                return AccessDeniedView();

            if (!ModelState.IsValid)
                return Configure();

            //save settings
            _avalaraTaxSettings.AccountId = model.AccountId;
            _avalaraTaxSettings.LicenseKey = model.LicenseKey;
            _avalaraTaxSettings.CompanyCode = model.CompanyCode;
            _avalaraTaxSettings.UseSandbox = model.UseSandbox;
            _avalaraTaxSettings.CommitTransactions = model.CommitTransactions;
            _avalaraTaxSettings.ValidateAddress = model.ValidateAddress;
            _settingService.SaveSetting(_avalaraTaxSettings);

            SuccessNotification(_localizationService.GetResource("Admin.Plugins.Saved"));

            return Configure();
        }

        [HttpPost, ActionName("Configure")]
        [FormValueRequired("verifyCredentials")]
        public ActionResult VerifyCredentials(ConfigurationModel model)
        {
            if (!_permissionService.Authorize(StandardPermissionProvider.ManageTaxSettings))
                return AccessDeniedView();

            if (!ModelState.IsValid)
                return Configure();

            //verify credentials 
            var result = _avalaraTaxManager.Ping();

            //display results
            if (result?.authenticated ?? false)
                SuccessNotification(_localizationService.GetResource("Plugins.Tax.Avalara.VerifyCredentials.Verified"));
            else
                ErrorNotification(_localizationService.GetResource("Plugins.Tax.Avalara.VerifyCredentials.Declined"));

            return Configure();
        }

        [HttpPost, ActionName("Configure")]
        [FormValueRequired("testTax")]
        public ActionResult TestTaxRequest(ConfigurationModel model)
        {
            if (!_permissionService.Authorize(StandardPermissionProvider.ManageTaxSettings))
                return AccessDeniedView();

            if (!ModelState.IsValid)
                return Configure();

            var taxProvider = _taxService.LoadTaxProviderBySystemName(AvalaraTaxDefaults.SystemName) as AvalaraTaxProvider;

            //get result
            var transaction = taxProvider.CreateEstimatedTaxTransaction(new Address
            {
                City = model.TestAddress?.City,
                Country = _countryService.GetCountryById(model.TestAddress?.CountryId ?? 0),
                Address1 = model.TestAddress?.Address1,
                ZipPostalCode = model.TestAddress?.ZipPostalCode,
                StateProvince = _stateProvinceService.GetStateProvinceById(model.TestAddress?.StateProvinceId ?? 0)
            }, _workContext.CurrentCustomer.Id.ToString());

            if (transaction?.totalTax != null)
            {
                //display tax rates by jurisdictions
                model.TestTaxResult = $"Total tax rate: {transaction.totalTax:0.00}% {Environment.NewLine}";
                if (transaction.summary?.Any() ?? false)
                {
                    model.TestTaxResult = transaction.summary.Aggregate(model.TestTaxResult, (resultString, rate) =>
                        $"{resultString}Jurisdiction: {rate?.jurisName}, Tax rate: {((rate?.rate ?? 0) * 100):0.00}% {Environment.NewLine}");
                }
                SuccessNotification(_localizationService.GetResource("Plugins.Tax.Avalara.TestTax.Success"));
            }
            else
                ErrorNotification(_localizationService.GetResource("Plugins.Tax.Avalara.TestTax.Error"));

            //prepare model
            model.IsConfigured = IsConfigured();
            PrepareAddress(model.TestAddress);

            return View("~/Plugins/Tax.Avalara/Views/Configuration/Configure.cshtml", model);
        }

        #endregion
    }
}