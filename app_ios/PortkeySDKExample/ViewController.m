//
//  ViewController.m
//  PortkeySDK
//
//  Created by wade-portkey on 09/13/2023.
//  Copyright (c) 2023 wade-portkey. All rights reserved.
//

#import "ViewController.h"
#import <PortkeySDK/PortkeySDKRNViewController.h>
#import <PortkeySDK/PortkeySDKRouterModule.h>
#import <PortkeySDK/PortkeySDKMMKVStorage.h>
#import <YYKit/YYKit.h>
#import <Toast/Toast.h>
#import "TermsOfServiceViewController.h"
#import <PortkeySDK/PortkeySDKJSCallModule.h>
#import "BundleConfigViewController.h"
#import <PortkeySDK/PortkeySDKContractModule.h>
#import <PortkeySDK/NSDictionary+PortkeySDK.h>
#import <PortkeySDK/PortkeySDKPortkey.h>

@interface ViewController ()

@property (nonatomic, strong) UIButton *loginButton;

@property (nonatomic, strong) UIButton *switchChainButton;

@property (nonatomic, strong) UIButton *switchNetworkButton;

@property (nonatomic, strong) UIButton *mainNetButton;
@property (nonatomic, strong) UIButton *testNetButton;
@property (nonatomic, strong) UIButton *test1NetButton;

@property (nonatomic, strong) UIButton *openPageButton;

@property (nonatomic, strong) UIButton *exitButton;

@property (nonatomic, strong) UIButton *termsButton;
@property (nonatomic, strong) UIButton *bundleConfigButton;
@property (nonatomic, strong) UIButton *contractCallButton;
@property (nonatomic, strong) PortkeySDKContractModule *contractModule;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.title = @"Portkey SDK";
    
    CGSize screenSize = UIScreen.mainScreen.bounds.size;
    
    CGRect loginButtonRect = CGRectZero;
    loginButtonRect.size = [self buttonSize];
    loginButtonRect.origin = CGPointMake((screenSize.width - [self buttonSize].width) / 2, 100);
    self.loginButton.frame = loginButtonRect;
    [self.view addSubview:self.loginButton];
    
    self.switchChainButton = [self createButtonWithTitle:@"Switch Chain"];
    self.switchChainButton.frame = self.loginButton.frame;
    self.switchChainButton.top = self.loginButton.bottom + 20;
    @weakify(self)
    [self.switchChainButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        [self presentViewController:[self createSwitchChainAlertController] animated:YES completion:nil];
    }];
    [self.view addSubview:self.switchChainButton];
    
    self.switchNetworkButton = [self createButtonWithTitle:@"Switch Network"];
    self.switchNetworkButton.frame = self.loginButton.frame;
    self.switchNetworkButton.top = self.switchChainButton.bottom + 5;
    [self.switchNetworkButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        [self presentViewController:[self createSwitchNetworkAlertController] animated:YES completion:nil];
    }];
    [self.view addSubview:self.switchNetworkButton];
    
    self.exitButton = [self createButtonWithTitle:@"Exit Wallet"];
    self.exitButton.frame = self.switchNetworkButton.frame;
    self.exitButton.top = self.switchNetworkButton.bottom + 20;
    [self.exitButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        [self exitWallet];
    }];
    [self.view addSubview:self.exitButton];
    
    self.termsButton = [self createButtonWithTitle:@"Config Terms Of Service"];
    self.termsButton.frame = self.exitButton.frame;
    self.termsButton.top = self.exitButton.bottom + 5;
    [self.termsButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        [self configTermsOfService];
    }];
    [self.view addSubview:self.termsButton];
    
    self.openPageButton = [self createButtonWithTitle:@"Open Portkey Page"];
    self.openPageButton.frame = self.termsButton.frame;
    self.openPageButton.top = self.termsButton.bottom + 5;
    [self.openPageButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        NSString *walletConfig = [PortkeySDKMMKVStorage readTempString:@"walletConfig"];
        if ([walletConfig isKindOfClass:NSString.class] && walletConfig.length) {
            [self presentViewController:[self createOpenPageAlertController] animated:YES completion:nil];
        } else {
            [self.view makeToast:@"Please login or unlock first"];
        }
    }];
    [self.view addSubview:self.openPageButton];
    
    self.bundleConfigButton = [self createButtonWithTitle:@"Config Bundle"];
    self.bundleConfigButton.frame = self.openPageButton.frame;
    self.bundleConfigButton.top = self.openPageButton.bottom + 20;
    [self.bundleConfigButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        [self.navigationController pushViewController:[BundleConfigViewController new] animated:YES];
    }];
    [self.view addSubview:self.bundleConfigButton];
 
    self.contractCallButton = [self createButtonWithTitle:@"Contract Call"];
    self.contractCallButton.frame = self.bundleConfigButton.frame;
    self.contractCallButton.top = self.bundleConfigButton.bottom + 5;
    [self.contractCallButton addBlockForControlEvents:UIControlEventTouchUpInside block:^(id  _Nonnull sender) {
        @strongify(self)
        PortkeySDKContractCallParam *callParam = [PortkeySDKContractCallParam new];
        callParam.contractMethodName = @"GetVerifierServers";
        callParam.isViewMethod = NO;
        [self.contractModule callCaContractMethodWithParam:callParam callback:^(NSError * _Nullable error, NSDictionary * _Nullable result) {
            if (error) {
                [self.view makeToast:@"call contract [GetVerifierServers] error"];
            } else {
                [self.view makeToast:[result portkey_jsonString]];
            }
        }];
    }];
    [self.view addSubview:self.contractCallButton];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
}

#pragma mark - Private

- (UIAlertController *)createSwitchChainAlertController {
    NSString *currentChain = [PortkeySDKMMKVStorage readString:@"currChainId"] ?: @"Default";
    NSString *message = [NSString stringWithFormat:@"Current Chain is %@", currentChain];
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Switch Chain" message:message preferredStyle:UIAlertControllerStyleActionSheet];
    UIAlertAction *mainChain = [UIAlertAction actionWithTitle:@"MAIN CHAIN" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchChainWithChainId:@"AELF"];
    }];
    UIAlertAction *tdvvChain = [UIAlertAction actionWithTitle:@"SIDE CHAIN tDVV" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchChainWithChainId:@"tDVV"];
    }];
    UIAlertAction *tdvwChain = [UIAlertAction actionWithTitle:@"SIDE CHAIN tDVW" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchChainWithChainId:@"tDVW"];
    }];
    UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil];
    [alert addAction:mainChain];
    [alert addAction:tdvvChain];
    [alert addAction:tdvwChain];
    [alert addAction:cancel];
    return alert;
}

- (UIAlertController *)createSwitchNetworkAlertController {
    NSString *currentUrl = [PortkeySDKMMKVStorage readString:@"endPointUrl"] ?: @"Default";
    NSString *message = [NSString stringWithFormat:@"Current endPointUrl is %@", currentUrl];
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Switch Network" message:message preferredStyle:UIAlertControllerStyleActionSheet];
    UIAlertAction *mainNetwork = [UIAlertAction actionWithTitle:@"MAIN NET" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchEndPointUrl:@"https://did-portkey.portkey.finance"];
    }];
    UIAlertAction *testNetwork = [UIAlertAction actionWithTitle:@"TEST NET" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchEndPointUrl:@"https://did-portkey-test.portkey.finance"];
    }];
    UIAlertAction *test1Network = [UIAlertAction actionWithTitle:@"TEST1 NET" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [self switchEndPointUrl:@"https://localtest-applesign.portkey.finance"];
    }];
    UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil];
    [alert addAction:mainNetwork];
    [alert addAction:testNetwork];
    [alert addAction:test1Network];
    [alert addAction:cancel];
    return alert;
}

- (UIAlertController *)createOpenPageAlertController {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Open Portkey Page" message:@"" preferredStyle:UIAlertControllerStyleActionSheet];
    UIAlertAction *scanQrcode = [UIAlertAction actionWithTitle:@"Scan QRCode" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[PortkeySDKRouterModule sharedInstance] navigateTo:@"portkey_scan_qr_code_entry" launchMode:@"" from:@"" targetScene:@"" closeCurrentScreen:NO params:@{}];
    }];
    UIAlertAction *guardianHome = [UIAlertAction actionWithTitle:@"Guardian Home" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[PortkeySDKRouterModule sharedInstance] navigateTo:@"portkey_guardian_home_entry" launchMode:@"" from:@"" targetScene:@"" closeCurrentScreen:NO params:@{}];
    }];
    UIAlertAction *accountSetting = [UIAlertAction actionWithTitle:@"Account Setting" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[PortkeySDKRouterModule sharedInstance] navigateTo:@"portkey_account_setting_entry" launchMode:@"single_task" from:@"" targetScene:@"" closeCurrentScreen:NO params:@{}];
    }];
    UIAlertAction *assetsHome = [UIAlertAction actionWithTitle:@"Assets Home" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[PortkeySDKRouterModule sharedInstance] navigateTo:@"portkey_assets_home_entry" launchMode:@"single_task" from:@"" targetScene:@"" closeCurrentScreen:NO params:@{}];
    }];
    UIAlertAction *paymentSecurity = [UIAlertAction actionWithTitle:@"PaymentSecurity" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[PortkeySDKRouterModule sharedInstance] navigateTo:@"portkey_payment_security_home_entry" launchMode:@"single_task" from:@"" targetScene:@"" closeCurrentScreen:NO params:@{}];
    }];
    UIAlertAction *cancel = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil];
    [alert addAction:scanQrcode];
    [alert addAction:guardianHome];
    [alert addAction:accountSetting];
    [alert addAction:assetsHome];
    [alert addAction:paymentSecurity];
    [alert addAction:cancel];
    return alert;
}

#pragma mark - Selector

- (void)loginButtonClicked:(id)sender {
    [[PortkeySDKRouterModule sharedInstance] navigateToWithOptions:@"portkey_sign_in_entry"
                                                        launchMode:@""
                                                              from:@""
                                                            params:@{}
                                                          callback:^(NSArray *response) {
        NSLog(@"response: %@", response);
    }];
}

- (void)switchChainWithChainId:(NSString *)chainId {
    [PortkeySDKMMKVStorage writeString:chainId forKey:@"currChainId"];
    [self.view makeToast:[NSString stringWithFormat:@"chainId changed to %@", chainId]];
}

- (void)switchEndPointUrl:(NSString *)url {
    [PortkeySDKMMKVStorage writeString:url forKey:@"endPointUrl"];
    [self.view makeToast:[NSString stringWithFormat:@"endPoint changed to %@", url]];
}

- (void)exitWallet {
    NSString *walletConfig = [PortkeySDKMMKVStorage readTempString:@"walletConfig"];
    if ([walletConfig isKindOfClass:NSString.class] && walletConfig.length) {
        [[PortkeySDKPortkey portkey].wallet exitWallet:^(BOOL success, NSString * _Nullable errorMsg) {
            if (success) {
                [PortkeySDKMMKVStorage clear];
                [self.view makeToast:@"Exit Wallet Successfully"];
            } else if (errorMsg.length > 0) {
                NSLog(@"error: %@", errorMsg);
                [self.view makeToast:errorMsg];
            }
        }];
    } else {
        [self.view makeToast:@"Please login or unlock first"];
    }
}

- (void)configTermsOfService {
    TermsOfServiceViewController *vc = [TermsOfServiceViewController new];
    [self.navigationController pushViewController:vc animated:YES];
}

#pragma mark - Getter

- (UIButton *)loginButton {
    if (!_loginButton) {
        _loginButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
        _loginButton.layer.cornerRadius = 8;
        [_loginButton setTitle:@"Login and Register" forState:UIControlStateNormal];
        _loginButton.titleLabel.font = [UIFont boldSystemFontOfSize:18];
        [_loginButton setBackgroundColor:[UIColor lightGrayColor]];
        [_loginButton addTarget:self action:@selector(loginButtonClicked:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _loginButton;
}

- (CGSize)buttonSize {
    return CGSizeMake(300, 44);
}

- (UIButton *)createButtonWithTitle:(NSString *)title {
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.layer.cornerRadius = 8;
    [button setTitle:title forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont boldSystemFontOfSize:18];
    [button setBackgroundColor:[UIColor lightGrayColor]];
    return button;
}

- (PortkeySDKContractModule *)contractModule {
    if (!_contractModule) {
        _contractModule = [PortkeySDKContractModule new];
    }
    return _contractModule;
}

@end
