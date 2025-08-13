# 🔗 Existing API Integration Guide

## ✅ What's Been Implemented

Your React infrastructure configurator now automatically connects to your **existing C# API** running on localhost:5000! No changes needed to your C# server.

### 🚀 Smart API Discovery

The system automatically discovers your API endpoints by:

1. **Swagger/OpenAPI Detection** - Checks for `/swagger/v1/swagger.json`, `/api-docs`, etc.
2. **Automatic Tool Mapping** - Converts each endpoint into a usable "tool"
3. **Parameter Extraction** - Automatically identifies required parameters
4. **Intelligent Fallback** - Probes common endpoint patterns if no spec found

### 🔧 Key Features

- ✅ **Zero Backend Changes Required** - Works with your existing API as-is
- ✅ **Automatic Endpoint Discovery** - Finds and maps all your endpoints
- ✅ **Interactive Testing** - Test any endpoint with real parameters
- ✅ **AI Integration Ready** - Your endpoints become AI assistant tools
- ✅ **Real-time Connection Status** - Visual feedback on API connectivity
- ✅ **Custom Endpoint Testing** - Test any endpoint manually

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Your C# API Server
Make sure your C# server is running on localhost:5000 with Swagger enabled.

### Step 2: Enable CORS (If Needed)
Add this to your C# server if CORS errors occur:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors();
```

### Step 3: Start the React App
```bash
cd /Users/avnishkumar/Documents/infrastructure-configurator
npm start
```

### Step 4: Test the Integration
1. The app will start with the **API Explorer** visible
2. Check the connection status (should be green)
3. See your API endpoints automatically discovered
4. Test any endpoint by clicking on it and filling parameters
5. Use the toggle button to switch to the main configurator

## 🔍 Using the API Explorer

### Automatic Discovery
The system will automatically find your endpoints in these ways:

1. **From Swagger Spec** - If you have `/swagger/v1/swagger.json` available
2. **Common Patterns** - Automatically tries endpoints like:
   - `/api/health`
   - `/api/status`
   - `/api/config`
   - `/api/validate`
   - `/api/process`
   - `/api/generate`

### Testing Endpoints
1. **Select an Endpoint** - Click on any discovered endpoint
2. **Fill Parameters** - Enter required parameters in the form
3. **Test It** - Click the test button to call your API
4. **View Results** - See the formatted response

### Custom Endpoint Testing
Use the "Test Custom Endpoint" section to test any endpoint not auto-discovered:
1. Select HTTP method (GET, POST, PUT, DELETE)
2. Enter the endpoint path (e.g., `/api/your-endpoint`)
3. Fill in parameters if needed
4. Click "Test" to call it

## 🤖 AI Assistant Integration

Once your endpoints are discovered, they automatically become available to the AI assistant:

### Before Integration:
```
User: "Validate my configuration"
AI: "I can help with general validation advice..."
```

### After Integration:
```
User: "Validate my configuration"
AI: "I can validate your configuration using your validation API!
     [Calls your /api/validate endpoint]
     ✅ Results: [Your actual API response]"
```

### How It Works:
1. **Tool Discovery** - Your endpoints become "tools" the AI can use
2. **Smart Mapping** - The AI learns what each endpoint does from Swagger descriptions
3. **Parameter Handling** - The AI can fill in parameters based on context
4. **Real Results** - The AI gets actual responses from your API

## 🛠️ Supported API Patterns

The adapter works with these common patterns:

### RESTful APIs
```
GET    /api/resources
POST   /api/resources
GET    /api/resources/{id}
PUT    /api/resources/{id}
DELETE /api/resources/{id}
```

### RPC-style APIs
```
POST   /api/validate
POST   /api/process
POST   /api/generate
POST   /api/transform
```

### Status/Health APIs
```
GET    /api/health
GET    /api/status
GET    /api/version
GET    /api/info
```

## 📊 Example Tool Mappings

Your existing endpoints automatically become AI tools:

| Your Endpoint | Becomes Tool | Description |
|---------------|--------------|-------------|
| `GET /api/health` | `health_check` | Check API health status |
| `POST /api/validate` | `validate_data` | Validate data or configuration |
| `GET /api/config` | `get_configuration` | Get current configuration |
| `POST /api/process` | `process_data` | Process submitted data |
| `GET /api/status` | `status_check` | Get system status |

## 🔧 Troubleshooting

### "Not Connected" Status
1. **Check if your C# server is running** on localhost:5000
2. **Test manually**: Open http://localhost:5000 in browser
3. **Check CORS**: Add React app origin to CORS policy
4. **Check Swagger**: Verify /swagger/v1/swagger.json is accessible

### "No Tools Available"
1. **Check Swagger endpoint**: Try http://localhost:5000/swagger/v1/swagger.json
2. **Verify API is responding**: Test a simple GET endpoint
3. **Check console logs**: Look for discovery errors in browser console

### "API Call Failed"
1. **Check parameters**: Ensure required parameters are provided
2. **Check endpoint path**: Verify the endpoint exists and is correct
3. **Check request format**: Ensure JSON format matches your API expectations
4. **Check server logs**: Look at your C# server logs for errors

### CORS Errors
Add this to your C# server configuration:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors();
```

## 🎯 Next Steps

### Phase 1: Test Your Existing API
1. ✅ Use the API Explorer to verify all endpoints work
2. ✅ Test different parameter combinations
3. ✅ Confirm responses are formatted correctly

### Phase 2: Enhance AI Integration
1. Add better descriptions to your Swagger documentation
2. Consider grouping related endpoints for better AI understanding
3. Add example parameters to your Swagger specs

### Phase 3: Production Deployment
1. Update the base URL configuration for production
2. Ensure production CORS settings include your production domain
3. Test the full integration in production environment

## 📝 Key Files Created/Modified

- ✅ `src/services/existingApiMCPAdapter.js` - Main API adapter
- ✅ `src/hooks/useMCPIntegration.js` - Updated integration hook
- ✅ `src/components/ExistingAPIExplorer.js` - API testing interface
- ✅ `src/App.js` - Toggle between explorer and main app
- ✅ `EXISTING_API_INTEGRATION_GUIDE.md` - This guide

## 🎉 Success!

Your infrastructure configurator now works with your existing C# API! The AI assistant can discover and use your existing endpoints without requiring any changes to your backend.

**Key Benefits:**
- 🚀 **Immediate Integration** - Works with your API as it exists today
- 🔍 **Auto-Discovery** - Finds endpoints automatically via Swagger
- 🤖 **AI-Powered** - Your endpoints become intelligent assistant tools
- 🧪 **Easy Testing** - Interactive API explorer for development
- 📈 **Scalable** - Automatically adapts as you add new endpoints

The React app will now intelligently use your existing API endpoints to help users with infrastructure configuration tasks!