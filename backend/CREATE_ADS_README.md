# Create Professional Ads

This script creates professional, relevant advertisements for the TOP Design business.

## Features

- ✅ Creates 5 professional ads relevant to design/printing business
- ✅ Automatically uses existing product images when available
- ✅ Removes test/demo ads before creating new ones
- ✅ Professional color schemes and messaging
- ✅ Proper links to relevant pages

## Ads Created

1. **Professional Design Services** - Purple theme, links to products
2. **Premium Banner Printing** - Blue theme, links to banners category
3. **Custom Printing Solutions** - Green theme, links to printing category
4. **Fast & Reliable Delivery** - Orange theme, highlights delivery speed
5. **Quality You Can Trust** - Pink theme, links to about page

## How to Run

### Option 1: Using npm script (Recommended)
```bash
cd backend
npm run create-ads
```

### Option 2: Direct node command
```bash
cd backend
node create-professional-ads.js
```

## What It Does

1. **Cleans up test ads** - Removes any test/demo ads (like "Muhire", "test", etc.)
2. **Removes old professional ads** - Prevents duplicates
3. **Finds available images** - Automatically uses product images if available
4. **Creates new ads** - Inserts 5 professional ads with proper colors and links
5. **Sets proper display order** - Ads will appear in the correct sequence

## Ad Details

Each ad includes:
- Professional title and description
- Appropriate color scheme (purple, blue, green, orange, pink)
- White text for readability
- Relevant link URLs
- Proper button text
- Active status (will show immediately)
- Display order (1-5)

## Customization

To customize the ads, edit `create-professional-ads.js` and modify the `professionalAds` array.

You can:
- Change titles and descriptions
- Update colors (background_color, text_color)
- Modify links (link_url)
- Change button text
- Add/remove ads
- Set start/end dates for time-limited campaigns

## Cleanup Test Ads

To remove only test ads without creating new ones:

```bash
npm run cleanup-ads
```

Or:

```bash
node cleanup-test-ads.js
```

## Notes

- Ads will appear immediately on the homepage carousel
- Images are optional - ads work great with gradient backgrounds too
- All ads are set to active by default
- Display order determines the sequence (1 = first, 5 = last)

