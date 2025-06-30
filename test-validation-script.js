/**
 * Sri Lankan Tourism Website - Test Validation Script
 * Run this script in the browser console to test key functionality
 */

class WebsiteValidator {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
    }

    log(message, type = 'info') {
        const styles = {
            info: 'color: blue;',
            pass: 'color: green; font-weight: bold;',
            fail: 'color: red; font-weight: bold;',
            header: 'color: purple; font-size: 16px; font-weight: bold;'
        };
        console.log(`%c${message}`, styles[type] || styles.info);
    }

    test(name, testFunction) {
        this.testCount++;
        try {
            const result = testFunction();
            if (result) {
                this.passCount++;
                this.log(`✅ ${name}`, 'pass');
                this.results.push({ name, status: 'PASS', result });
            } else {
                this.log(`❌ ${name}`, 'fail');
                this.results.push({ name, status: 'FAIL', result });
            }
        } catch (error) {
            this.log(`❌ ${name} - Error: ${error.message}`, 'fail');
            this.results.push({ name, status: 'ERROR', error: error.message });
        }
    }

    async asyncTest(name, testFunction) {
        this.testCount++;
        try {
            const result = await testFunction();
            if (result) {
                this.passCount++;
                this.log(`✅ ${name}`, 'pass');
                this.results.push({ name, status: 'PASS', result });
            } else {
                this.log(`❌ ${name}`, 'fail');
                this.results.push({ name, status: 'FAIL', result });
            }
        } catch (error) {
            this.log(`❌ ${name} - Error: ${error.message}`, 'fail');
            this.results.push({ name, status: 'ERROR', error: error.message });
        }
    }

    // Test Core Page Structure
    testPageStructure() {
        this.log('🔍 Testing Page Structure', 'header');
        
        this.test('HTML document exists', () => {
            return document && document.doctype;
        });

        this.test('Meta charset is set', () => {
            const charset = document.querySelector('meta[charset]');
            return charset && charset.getAttribute('charset').toLowerCase() === 'utf-8';
        });

        this.test('Viewport meta tag exists', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            return viewport && viewport.getAttribute('content').includes('width=device-width');
        });

        this.test('Main navigation exists', () => {
            const nav = document.querySelector('nav') || document.querySelector('.navbar');
            return nav !== null;
        });

        this.test('Footer exists', () => {
            const footer = document.querySelector('footer');
            return footer !== null;
        });
    }

    // Test Navigation and Links
    testNavigation() {
        this.log('🧭 Testing Navigation', 'header');

        this.test('Hotels link exists in navigation', () => {
            const hotelsLink = document.querySelector('a[href*="hotels"]');
            return hotelsLink !== null;
        });

        this.test('Transport link exists', () => {
            const transportLink = document.querySelector('a[href*="transport"]');
            return transportLink !== null;
        });

        this.test('Home/Index link exists', () => {
            const homeLink = document.querySelector('a[href*="index"]') || 
                           document.querySelector('a[href="/"]') ||
                           document.querySelector('a[href="#home"]');
            return homeLink !== null;
        });

        this.test('Admin link exists', () => {
            const adminLink = document.querySelector('a[href*="admin"]');
            return adminLink !== null;
        });
    }

    // Test Search Functionality
    testSearchFunctionality() {
        this.log('🔍 Testing Search Functionality', 'header');

        this.test('Search input exists', () => {
            const searchInput = document.querySelector('input[type="search"]') ||
                              document.querySelector('input[placeholder*="search"]') ||
                              document.querySelector('#quickSearch');
            return searchInput !== null;
        });

        this.test('Search functionality is defined', () => {
            return typeof window.performQuickSearch === 'function' ||
                   typeof window.handleSearch === 'function';
        });
    }

    // Test Hotel Booking System
    testHotelSystem() {
        this.log('🏨 Testing Hotel System', 'header');

        this.test('Hotel data is available', () => {
            return window.hotelData || 
                   window.hotels || 
                   (localStorage.getItem('hotelData') !== null);
        });

        this.test('Hotel management functions exist', () => {
            return typeof window.loadHotels === 'function' ||
                   typeof window.initHotels === 'function';
        });
    }

    // Test Transport System
    testTransportSystem() {
        this.log('🚗 Testing Transport System', 'header');

        this.test('Transport calculation function exists', () => {
            return typeof window.calculateTransportQuote === 'function' ||
                   typeof window.calculatePrice === 'function';
        });

        this.test('Vehicle data is available', () => {
            return window.vehicles || 
                   document.querySelector('.vehicle-option') !== null;
        });

        this.test('Booking form exists', () => {
            const bookingForm = document.querySelector('#bookingForm') ||
                              document.querySelector('.booking-form');
            return bookingForm !== null;
        });
    }

    // Test Admin System
    testAdminSystem() {
        this.log('👨‍💼 Testing Admin System', 'header');

        this.test('Admin authentication functions exist', () => {
            return typeof window.login === 'function' ||
                   typeof window.adminLogin === 'function';
        });

        this.test('Admin data management functions exist', () => {
            return typeof window.saveToLocalStorage === 'function' ||
                   typeof window.updateHotelData === 'function';
        });
    }

    // Test Responsive Design
    testResponsiveDesign() {
        this.log('📱 Testing Responsive Design', 'header');

        this.test('Responsive meta tag is present', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            return viewport && viewport.getAttribute('content').includes('width=device-width');
        });

        this.test('CSS media queries exist', () => {
            const styleSheets = Array.from(document.styleSheets);
            for (let sheet of styleSheets) {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    for (let rule of rules) {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            return true;
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet, skip
                }
            }
            return false;
        });
    }

    // Test Performance
    async testPerformance() {
        this.log('⚡ Testing Performance', 'header');

        if (window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.test('Page load time < 3 seconds', () => {
                return navigation.loadEventEnd - navigation.fetchStart < 3000;
            });

            this.test('DOM content loaded < 2 seconds', () => {
                return navigation.domContentLoadedEventEnd - navigation.fetchStart < 2000;
            });
        }

        this.test('Images are optimized (checking first few)', () => {
            const images = document.querySelectorAll('img');
            let optimized = true;
            
            // Check first 5 images
            for (let i = 0; i < Math.min(5, images.length); i++) {
                const img = images[i];
                if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
                    optimized = false;
                    break;
                }
            }
            return optimized;
        });
    }

    // Test Accessibility
    testAccessibility() {
        this.log('♿ Testing Accessibility', 'header');

        this.test('Images have alt attributes', () => {
            const images = document.querySelectorAll('img');
            for (let img of images) {
                if (!img.hasAttribute('alt')) {
                    return false;
                }
            }
            return images.length > 0;
        });

        this.test('Form inputs have labels', () => {
            const inputs = document.querySelectorAll('input, select, textarea');
            for (let input of inputs) {
                const label = document.querySelector(`label[for="${input.id}"]`) ||
                            input.closest('label');
                if (!label && input.type !== 'hidden' && input.type !== 'submit') {
                    return false;
                }
            }
            return true;
        });

        this.test('Page has proper heading structure', () => {
            const h1 = document.querySelector('h1');
            return h1 !== null;
        });
    }

    // Test LocalStorage Usage
    testDataManagement() {
        this.log('💾 Testing Data Management', 'header');

        this.test('LocalStorage is available', () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        });

        this.test('Data management functions exist', () => {
            return typeof window.saveToLocalStorage === 'function' ||
                   typeof window.loadFromLocalStorage === 'function';
        });
    }

    // Generate summary report
    generateSummary() {
        this.log('\n📊 Test Summary Report', 'header');
        this.log(`Total Tests: ${this.testCount}`);
        this.log(`Passed: ${this.passCount}`, 'pass');
        this.log(`Failed: ${this.testCount - this.passCount}`, 'fail');
        this.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);

        if (this.results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length > 0) {
            this.log('\n❌ Failed Tests:', 'fail');
            this.results
                .filter(r => r.status === 'FAIL' || r.status === 'ERROR')
                .forEach(r => this.log(`  - ${r.name}`));
        }

        return {
            total: this.testCount,
            passed: this.passCount,
            failed: this.testCount - this.passCount,
            successRate: (this.passCount / this.testCount) * 100,
            results: this.results
        };
    }

    // Run all tests
    async runAllTests() {
        this.log('🚀 Starting Website Validation Tests\n', 'header');
        
        this.testPageStructure();
        this.testNavigation();
        this.testSearchFunctionality();
        this.testHotelSystem();
        this.testTransportSystem();
        this.testAdminSystem();
        this.testResponsiveDesign();
        await this.testPerformance();
        this.testAccessibility();
        this.testDataManagement();

        return this.generateSummary();
    }
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    window.validateWebsite = async function() {
        const validator = new WebsiteValidator();
        return await validator.runAllTests();
    };

    // Show instructions
    console.log('%c🎯 Sri Lankan Tourism Website Test Suite', 'color: purple; font-size: 18px; font-weight: bold;');
    console.log('%cTo run all tests, execute: validateWebsite()', 'color: blue; font-size: 14px;');
    console.log('%cOr run individual test sections by creating a new WebsiteValidator instance', 'color: blue;');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteValidator;
} 